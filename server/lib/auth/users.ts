import { sql, isDatabaseAvailable } from "../db/client";
import bcrypt from "bcryptjs";

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: "admin" | "user";
  avatar?: string | null;
  created_at: Date;
  last_login?: Date | null;
  updated_at?: Date | null;
}

// Fallback: Almacenamiento en memoria si no hay base de datos
const memoryUsers: Map<string, User> = new Map();
let memoryUserId = 1;

// Usuarios demo para inicialización
const DEMO_USERS = [
  {
    email: "admin@proconnect.com",
    password: "admin123",
    name: "Administrador",
    role: "admin" as const,
  },
  {
    email: "demo@proconnect.com",
    password: "demo123",
    name: "Usuario Demo",
    role: "user" as const,
  },
];

// Inicializar usuarios demo en base de datos
async function initDemoUsers() {
  if (!isDatabaseAvailable()) return;

  try {
    for (const demoUser of DEMO_USERS) {
      // Verificar si ya existe
      const existing =
        await sql`SELECT id FROM users WHERE email = ${demoUser.email}`;

      if (!existing || existing.length === 0) {
        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(demoUser.password, 10);

        // Crear usuario demo
        await sql`
          INSERT INTO users (email, password, name, role)
          VALUES (${demoUser.email}, ${hashedPassword}, ${demoUser.name}, ${demoUser.role})
        `;

        console.log(`✅ Usuario demo creado: ${demoUser.email}`);
      }
    }
  } catch (error) {
    console.error("Error al inicializar usuarios demo:", error);
  }
}

// Inicializar usuarios demo al cargar el módulo
if (isDatabaseAvailable()) {
  initDemoUsers();
} else {
  // Modo memoria: inicializar usuarios demo
  DEMO_USERS.forEach((demoUser) => {
    const user: User = {
      id: memoryUserId++,
      email: demoUser.email,
      password: demoUser.password, // Sin hash en memoria para demo
      name: demoUser.name,
      role: demoUser.role,
      created_at: new Date(),
    };
    memoryUsers.set(user.email, user);
  });
}

export const UserService = {
  // Buscar usuario por email
  async findByEmail(email: string): Promise<User | null> {
    if (!isDatabaseAvailable()) {
      return memoryUsers.get(email) || null;
    }

    try {
      const result = await sql`
        SELECT * FROM users WHERE email = ${email}
      `;
      return result.length > 0 ? (result[0] as User) : null;
    } catch (error) {
      console.error("Error al buscar usuario por email:", error);
      return null;
    }
  },

  // Buscar usuario por ID
  async findById(id: number): Promise<User | null> {
    if (!isDatabaseAvailable()) {
      return (
        Array.from(memoryUsers.values()).find((user) => user.id === id) || null
      );
    }

    try {
      const result = await sql`
        SELECT * FROM users WHERE id = ${id}
      `;
      return result.length > 0 ? (result[0] as User) : null;
    } catch (error) {
      console.error("Error al buscar usuario por ID:", error);
      return null;
    }
  },

  // Crear nuevo usuario
  async create(userData: {
    email: string;
    password: string;
    name: string;
    role?: "admin" | "user";
  }): Promise<User | null> {
    if (!isDatabaseAvailable()) {
      // Modo memoria
      const user: User = {
        id: memoryUserId++,
        email: userData.email.toLowerCase().trim(),
        password: userData.password, // Sin hash en memoria
        name: userData.name.trim(),
        role: userData.role || "user",
        created_at: new Date(),
      };
      memoryUsers.set(user.email, user);
      return user;
    }

    try {
      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const result = await sql`
        INSERT INTO users (email, password, name, role)
        VALUES (
          ${userData.email.toLowerCase().trim()},
          ${hashedPassword},
          ${userData.name.trim()},
          ${userData.role || "user"}
        )
        RETURNING *
      `;

      return result.length > 0 ? (result[0] as User) : null;
    } catch (error) {
      console.error("Error al crear usuario:", error);
      return null;
    }
  },

  // Validar credenciales
  async validateCredentials(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    // Verificar contraseña
    const isValid = isDatabaseAvailable()
      ? await bcrypt.compare(password, user.password)
      : user.password === password; // Modo memoria: comparación directa

    if (!isValid) return null;

    // Actualizar último login
    if (isDatabaseAvailable()) {
      try {
        await sql`
          UPDATE users
          SET last_login = NOW()
          WHERE id = ${user.id}
        `;
      } catch (error) {
        console.error("Error al actualizar último login:", error);
      }
    } else {
      user.last_login = new Date();
    }

    return user;
  },

  // Actualizar usuario
  async update(
    id: number,
    updates: Partial<User>,
  ): Promise<User | null> {
    if (!isDatabaseAvailable()) {
      const user = Array.from(memoryUsers.values()).find((u) => u.id === id);
      if (!user) return null;

      const updatedUser = { ...user, ...updates };
      memoryUsers.set(user.email, updatedUser);
      return updatedUser;
    }

    try {
      const result = await sql`
        UPDATE users
        SET
          name = COALESCE(${updates.name}, name),
          avatar = COALESCE(${updates.avatar}, avatar),
          role = COALESCE(${updates.role}, role)
        WHERE id = ${id}
        RETURNING *
      `;

      return result.length > 0 ? (result[0] as User) : null;
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      return null;
    }
  },

  // Eliminar usuario
  async delete(id: number): Promise<boolean> {
    if (!isDatabaseAvailable()) {
      const user = Array.from(memoryUsers.values()).find((u) => u.id === id);
      if (!user) return false;
      return memoryUsers.delete(user.email);
    }

    try {
      const result = await sql`
        DELETE FROM users WHERE id = ${id}
      `;
      return result.length > 0;
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      return false;
    }
  },

  // Listar todos los usuarios (admin)
  async getAll(): Promise<User[]> {
    if (!isDatabaseAvailable()) {
      return Array.from(memoryUsers.values());
    }

    try {
      const result = await sql`
        SELECT * FROM users ORDER BY created_at DESC
      `;
      return result as User[];
    } catch (error) {
      console.error("Error al listar usuarios:", error);
      return [];
    }
  },

  // Obtener usuario sin contraseña (para respuestas)
  getSafeUser(user: User) {
    const { password, ...safeUser } = user;
    return safeUser;
  },
};

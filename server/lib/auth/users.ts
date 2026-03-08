// Sistema de usuarios en memoria
// TODO: Reemplazar con base de datos real (PostgreSQL, MongoDB, etc.)

export interface User {
  id: string;
  email: string;
  password: string; // En producción: hashear con bcrypt
  name: string;
  role: "admin" | "user";
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
}

// Simulación de base de datos en memoria
const users: Map<string, User> = new Map();

// Usuarios de demostración
const demoUsers: User[] = [
  {
    id: "1",
    email: "admin@proconnect.com",
    password: "admin123", // TODO: hashear
    name: "Administrador",
    role: "admin",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    email: "demo@proconnect.com",
    password: "demo123", // TODO: hashear
    name: "Usuario Demo",
    role: "user",
    createdAt: new Date("2024-01-15"),
  },
];

// Inicializar usuarios demo
demoUsers.forEach((user) => users.set(user.email, user));

// Funciones de gestión de usuarios
export const UserService = {
  // Buscar usuario por email
  findByEmail(email: string): User | undefined {
    return users.get(email);
  },

  // Buscar usuario por ID
  findById(id: string): User | undefined {
    return Array.from(users.values()).find((user) => user.id === id);
  },

  // Crear nuevo usuario
  create(userData: Omit<User, "id" | "createdAt">): User {
    const user: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    users.set(user.email, user);
    return user;
  },

  // Validar credenciales
  validateCredentials(email: string, password: string): User | null {
    const user = users.get(email);
    if (!user) return null;

    // TODO: En producción, usar bcrypt.compare()
    if (user.password !== password) return null;

    // Actualizar último login
    user.lastLogin = new Date();
    return user;
  },

  // Actualizar usuario
  update(email: string, updates: Partial<User>): User | null {
    const user = users.get(email);
    if (!user) return null;

    const updatedUser = { ...user, ...updates };
    users.set(email, updatedUser);
    return updatedUser;
  },

  // Eliminar usuario
  delete(email: string): boolean {
    return users.delete(email);
  },

  // Listar todos los usuarios (admin)
  getAll(): User[] {
    return Array.from(users.values());
  },

  // Obtener usuario sin contraseña (para respuestas)
  getSafeUser(user: User) {
    const { password, ...safeUser } = user;
    return safeUser;
  },
};

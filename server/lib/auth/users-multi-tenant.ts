import { sql, isDatabaseAvailable } from "../db/client";
import bcrypt from "bcryptjs";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  plan: string;
  status: string;
  logo_url: string | null;
  created_at: Date;
}

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  password: string;
  name: string;
  role: "owner" | "admin" | "user" | "viewer";
  avatar?: string | null;
  phone?: string | null;
  last_login?: Date | null;
  created_at: Date;
  updated_at?: Date | null;
}

export interface UserWithTenant extends User {
  tenant?: Tenant;
}

// Fallback: Almacenamiento en memoria si no hay base de datos
const memoryUsers: Map<string, User> = new Map();
const memoryTenants: Map<string, Tenant> = new Map();

export const UserService = {
  /**
   * Buscar usuario por email (puede estar en múltiples tenants)
   * Retorna el primer usuario encontrado
   */
  async findByEmail(email: string): Promise<UserWithTenant | null> {
    if (!isDatabaseAvailable()) {
      const user = memoryUsers.get(email);
      if (!user) return null;

      const tenant = memoryTenants.get(user.tenant_id);
      return { ...user, tenant: tenant || undefined };
    }

    try {
      const result = await sql`
        SELECT
          u.*,
          t.id as tenant_id,
          t.name as tenant_name,
          t.slug as tenant_slug,
          t.industry as tenant_industry,
          t.plan as tenant_plan,
          t.status as tenant_status,
          t.logo_url as tenant_logo_url
        FROM users_new u
        JOIN tenants t ON u.tenant_id = t.id
        WHERE u.email = ${email}
        AND t.deleted_at IS NULL
        ORDER BY u.created_at ASC
        LIMIT 1
      `;

      if (result.length === 0) return null;

      const row = result[0] as any;
      return {
        id: row.id,
        tenant_id: row.tenant_id,
        email: row.email,
        password: row.password,
        name: row.name,
        role: row.role,
        avatar: row.avatar,
        phone: row.phone,
        last_login: row.last_login,
        created_at: row.created_at,
        updated_at: row.updated_at,
        tenant: {
          id: row.tenant_id,
          name: row.tenant_name,
          slug: row.tenant_slug,
          industry: row.tenant_industry,
          plan: row.tenant_plan,
          status: row.tenant_status,
          logo_url: row.tenant_logo_url,
          created_at: row.created_at,
        },
      };
    } catch (error) {
      console.error("Error al buscar usuario por email:", error);
      return null;
    }
  },

  /**
   * Buscar usuario por email y tenant
   */
  async findByEmailAndTenant(
    email: string,
    tenant_id: string,
  ): Promise<User | null> {
    if (!isDatabaseAvailable()) {
      const user = memoryUsers.get(`${tenant_id}:${email}`);
      return user || null;
    }

    try {
      const result = await sql`
        SELECT * FROM users_new
        WHERE email = ${email}
        AND tenant_id = ${tenant_id}
      `;
      return result.length > 0 ? (result[0] as User) : null;
    } catch (error) {
      console.error("Error al buscar usuario:", error);
      return null;
    }
  },

  /**
   * Buscar usuario por ID
   */
  async findById(id: string): Promise<UserWithTenant | null> {
    if (!isDatabaseAvailable()) {
      for (const user of memoryUsers.values()) {
        if (user.id === id) {
          const tenant = memoryTenants.get(user.tenant_id);
          return { ...user, tenant: tenant || undefined };
        }
      }
      return null;
    }

    try {
      const result = await sql`
        SELECT
          u.*,
          t.id as tenant_id,
          t.name as tenant_name,
          t.slug as tenant_slug,
          t.industry as tenant_industry,
          t.plan as tenant_plan,
          t.status as tenant_status,
          t.logo_url as tenant_logo_url
        FROM users_new u
        JOIN tenants t ON u.tenant_id = t.id
        WHERE u.id = ${id}
        AND t.deleted_at IS NULL
      `;

      if (result.length === 0) return null;

      const row = result[0] as any;
      return {
        id: row.id,
        tenant_id: row.tenant_id,
        email: row.email,
        password: row.password,
        name: row.name,
        role: row.role,
        avatar: row.avatar,
        phone: row.phone,
        last_login: row.last_login,
        created_at: row.created_at,
        updated_at: row.updated_at,
        tenant: {
          id: row.tenant_id,
          name: row.tenant_name,
          slug: row.tenant_slug,
          industry: row.tenant_industry,
          plan: row.tenant_plan,
          status: row.tenant_status,
          logo_url: row.tenant_logo_url,
          created_at: row.created_at,
        },
      };
    } catch (error) {
      console.error("Error al buscar usuario por ID:", error);
      return null;
    }
  },

  /**
   * Validar credenciales de usuario
   */
  async validateCredentials(
    email: string,
    password: string,
  ): Promise<UserWithTenant | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    // Verificar contraseña
    const isValid = isDatabaseAvailable()
      ? await bcrypt.compare(password, user.password)
      : user.password === password;

    if (!isValid) return null;

    // Verificar que el tenant esté activo
    if (user.tenant && user.tenant.status !== "active") {
      console.log(
        `Tenant ${user.tenant.name} está inactivo (${user.tenant.status})`,
      );
      return null;
    }

    // Actualizar last_login
    if (isDatabaseAvailable()) {
      await sql`
        UPDATE users_new
        SET
          last_login = CURRENT_TIMESTAMP,
          login_count = login_count + 1
        WHERE id = ${user.id}
      `;
    }

    return user;
  },

  /**
   * Crear nuevo usuario
   */
  async create(data: {
    tenant_id: string;
    email: string;
    password: string;
    name: string;
    role?: User["role"];
  }): Promise<User | null> {
    const hashedPassword = isDatabaseAvailable()
      ? await bcrypt.hash(data.password, 10)
      : data.password;

    if (!isDatabaseAvailable()) {
      const user: User = {
        id: crypto.randomUUID(),
        tenant_id: data.tenant_id,
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role || "user",
        created_at: new Date(),
      };
      memoryUsers.set(`${data.tenant_id}:${data.email}`, user);
      return user;
    }

    try {
      const result = await sql`
        INSERT INTO users_new (
          tenant_id,
          email,
          password,
          name,
          role
        )
        VALUES (
          ${data.tenant_id},
          ${data.email},
          ${hashedPassword},
          ${data.name},
          ${data.role || "user"}
        )
        RETURNING *
      `;

      return result[0] as User;
    } catch (error) {
      console.error("Error al crear usuario:", error);
      return null;
    }
  },

  /**
   * Actualizar usuario
   */
  async update(
    id: string,
    data: Partial<Omit<User, "id" | "tenant_id" | "email">>,
  ): Promise<User | null> {
    if (!isDatabaseAvailable()) {
      for (const [key, user] of memoryUsers.entries()) {
        if (user.id === id) {
          const updated = { ...user, ...data };
          memoryUsers.set(key, updated);
          return updated;
        }
      }
      return null;
    }

    try {
      const setClauses: string[] = [];
      const values: any[] = [];

      if (data.name) {
        setClauses.push("name = $" + (values.length + 1));
        values.push(data.name);
      }
      if (data.avatar !== undefined) {
        setClauses.push("avatar = $" + (values.length + 1));
        values.push(data.avatar);
      }
      if (data.role) {
        setClauses.push("role = $" + (values.length + 1));
        values.push(data.role);
      }
      if (data.phone !== undefined) {
        setClauses.push("phone = $" + (values.length + 1));
        values.push(data.phone);
      }

      if (setClauses.length === 0) return null;

      const result = await sql`
        UPDATE users_new
        SET ${sql.unsafe(setClauses.join(", "))}
        WHERE id = ${id}
        RETURNING *
      `;

      return result.length > 0 ? (result[0] as User) : null;
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      return null;
    }
  },

  /**
   * Obtener todos los usuarios de un tenant
   */
  async getAllByTenant(tenant_id: string): Promise<User[]> {
    if (!isDatabaseAvailable()) {
      return Array.from(memoryUsers.values()).filter(
        (u) => u.tenant_id === tenant_id,
      );
    }

    try {
      const result = await sql`
        SELECT * FROM users_new
        WHERE tenant_id = ${tenant_id}
        ORDER BY created_at DESC
      `;
      return result as User[];
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      return [];
    }
  },

  /**
   * Retornar usuario sin información sensible
   */
  getSafeUser(user: User | UserWithTenant): Omit<User, "password"> {
    const { password, ...safeUser } = user;
    return safeUser;
  },
};

export const TenantService = {
  /**
   * Buscar tenant por slug
   */
  async findBySlug(slug: string): Promise<Tenant | null> {
    if (!isDatabaseAvailable()) {
      return memoryTenants.get(slug) || null;
    }

    try {
      const result = await sql`
        SELECT * FROM tenants
        WHERE slug = ${slug}
        AND deleted_at IS NULL
      `;
      return result.length > 0 ? (result[0] as Tenant) : null;
    } catch (error) {
      console.error("Error al buscar tenant:", error);
      return null;
    }
  },

  /**
   * Buscar tenant por ID
   */
  async findById(id: string): Promise<Tenant | null> {
    if (!isDatabaseAvailable()) {
      for (const tenant of memoryTenants.values()) {
        if (tenant.id === id) return tenant;
      }
      return null;
    }

    try {
      const result = await sql`
        SELECT * FROM tenants
        WHERE id = ${id}
        AND deleted_at IS NULL
      `;
      return result.length > 0 ? (result[0] as Tenant) : null;
    } catch (error) {
      console.error("Error al buscar tenant:", error);
      return null;
    }
  },

  /**
   * Crear nuevo tenant
   */
  async create(data: {
    name: string;
    slug: string;
    industry?: string;
    plan?: string;
    contact_email?: string;
  }): Promise<Tenant | null> {
    if (!isDatabaseAvailable()) {
      const tenant: Tenant = {
        id: crypto.randomUUID(),
        name: data.name,
        slug: data.slug,
        industry: data.industry || null,
        plan: data.plan || "free",
        status: "active",
        logo_url: null,
        created_at: new Date(),
      };
      memoryTenants.set(data.slug, tenant);
      return tenant;
    }

    try {
      const result = await sql`
        INSERT INTO tenants (
          name,
          slug,
          industry,
          plan,
          contact_email,
          status
        )
        VALUES (
          ${data.name},
          ${data.slug},
          ${data.industry || null},
          ${data.plan || "free"},
          ${data.contact_email || null},
          'active'
        )
        RETURNING *
      `;

      // Crear configuración del agente por defecto
      const tenant = result[0] as Tenant;
      await sql`
        INSERT INTO agent_configs (tenant_id)
        VALUES (${tenant.id})
        ON CONFLICT (tenant_id) DO NOTHING
      `;

      return tenant;
    } catch (error) {
      console.error("Error al crear tenant:", error);
      return null;
    }
  },

  /**
   * Validar que un slug esté disponible
   */
  async isSlugAvailable(slug: string): Promise<boolean> {
    const tenant = await this.findBySlug(slug);
    return tenant === null;
  },
};

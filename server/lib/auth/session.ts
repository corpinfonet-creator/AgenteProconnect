import type { H3Event } from "h3";
import type { User } from "./users";
import { sql, isDatabaseAvailable } from "../db/client";

export interface Session {
  id: string;
  user_id: number;
  created_at: Date;
  expires_at: Date;
  last_activity: Date;
}

// Fallback: Almacenamiento de sesiones en memoria
const memorySessions = new Map<string, Session>();

// Duración de la sesión: 7 días
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

export const SessionService = {
  // Crear sesión
  async create(user: User): Promise<string> {
    const sessionId = this.generateSessionId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_DURATION);

    if (!isDatabaseAvailable()) {
      // Modo memoria
      const session: Session = {
        id: sessionId,
        user_id: user.id,
        created_at: now,
        expires_at: expiresAt,
        last_activity: now,
      };
      memorySessions.set(sessionId, session);
      return sessionId;
    }

    try {
      await sql`
        INSERT INTO sessions (id, user_id, expires_at)
        VALUES (${sessionId}, ${user.id}, ${expiresAt.toISOString()})
      `;
      return sessionId;
    } catch (error) {
      console.error("Error al crear sesión:", error);
      throw error;
    }
  },

  // Obtener sesión
  async get(sessionId: string): Promise<Session | null> {
    if (!isDatabaseAvailable()) {
      const session = memorySessions.get(sessionId);
      if (!session) return null;

      // Verificar si expiró
      if (new Date() > session.expires_at) {
        await this.destroy(sessionId);
        return null;
      }

      return session;
    }

    try {
      const result = await sql`
        SELECT * FROM sessions
        WHERE id = ${sessionId}
        AND expires_at > NOW()
      `;

      if (result.length === 0) return null;

      // Actualizar última actividad
      await sql`
        UPDATE sessions
        SET last_activity = NOW()
        WHERE id = ${sessionId}
      `;

      return result[0] as Session;
    } catch (error) {
      console.error("Error al obtener sesión:", error);
      return null;
    }
  },

  // Destruir sesión
  async destroy(sessionId: string): Promise<boolean> {
    if (!isDatabaseAvailable()) {
      return memorySessions.delete(sessionId);
    }

    try {
      const result = await sql`
        DELETE FROM sessions WHERE id = ${sessionId}
      `;
      return result.length > 0;
    } catch (error) {
      console.error("Error al destruir sesión:", error);
      return false;
    }
  },

  // Limpiar sesiones expiradas
  async cleanup(): Promise<void> {
    if (!isDatabaseAvailable()) {
      const now = new Date();
      for (const [id, session] of memorySessions.entries()) {
        if (now > session.expires_at) {
          memorySessions.delete(id);
        }
      }
      return;
    }

    try {
      await sql`
        DELETE FROM sessions
        WHERE expires_at < NOW()
      `;
    } catch (error) {
      console.error("Error al limpiar sesiones:", error);
    }
  },

  // Generar ID de sesión único
  generateSessionId(): string {
    return Buffer.from(
      `${Date.now()}-${Math.random().toString(36)}-${Math.random().toString(36)}`,
    ).toString("base64");
  },

  // Obtener sesión desde evento HTTP
  async getFromEvent(event: H3Event): Promise<Session | null> {
    const sessionId = getCookie(event, "session");
    if (!sessionId) return null;
    return await this.get(sessionId);
  },

  // Establecer cookie de sesión
  setSessionCookie(event: H3Event, sessionId: string): void {
    setCookie(event, "session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION / 1000, // en segundos
      path: "/",
    });
  },

  // Eliminar cookie de sesión
  clearSessionCookie(event: H3Event): void {
    deleteCookie(event, "session", {
      path: "/",
    });
  },
};

// Limpiar sesiones expiradas cada hora
setInterval(() => {
  SessionService.cleanup();
}, 60 * 60 * 1000);

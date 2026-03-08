import type { H3Event } from "h3";
import type { User } from "./users";

export interface Session {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  expiresAt: Date;
}

// Almacenamiento de sesiones en memoria
// TODO: Usar Redis o base de datos para producción
const sessions = new Map<string, Session>();

// Duración de la sesión: 7 días
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

export const SessionService = {
  // Crear sesión
  create(user: User): string {
    const sessionId = this.generateSessionId();
    const now = new Date();

    const session: Session = {
      id: sessionId,
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: now,
      expiresAt: new Date(now.getTime() + SESSION_DURATION),
    };

    sessions.set(sessionId, session);
    return sessionId;
  },

  // Obtener sesión
  get(sessionId: string): Session | null {
    const session = sessions.get(sessionId);
    if (!session) return null;

    // Verificar si expiró
    if (new Date() > session.expiresAt) {
      this.destroy(sessionId);
      return null;
    }

    return session;
  },

  // Destruir sesión
  destroy(sessionId: string): boolean {
    return sessions.delete(sessionId);
  },

  // Limpiar sesiones expiradas
  cleanup(): void {
    const now = new Date();
    for (const [id, session] of sessions.entries()) {
      if (now > session.expiresAt) {
        sessions.delete(id);
      }
    }
  },

  // Generar ID de sesión único
  generateSessionId(): string {
    return Buffer.from(
      `${Date.now()}-${Math.random().toString(36)}`,
    ).toString("base64");
  },

  // Obtener sesión desde evento HTTP
  getFromEvent(event: H3Event): Session | null {
    const sessionId = getCookie(event, "session");
    if (!sessionId) return null;
    return this.get(sessionId);
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

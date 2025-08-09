import { nanoid } from "nanoid";
import {
  pgTable, text, timestamp, boolean,
  index, uniqueIndex
} from "drizzle-orm/pg-core";

/** USER */
export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").$defaultFn(() => false).notNull(),
    image: text("image"),
    // DB-сторона, тип Date в TS
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    emailIdx: uniqueIndex("user_email_uniq").on(t.email),
  })
);

/** SESSION */
export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => ({
    sessionUserIdx: index("session_user_id_idx").on(t.userId),
    sessionTokenUq: uniqueIndex("session_token_uniq").on(t.token),
  })
);

/** ACCOUNT */
export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true, mode: "date" }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true, mode: "date" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    // Обычный инвариант OAuth: один внешний аккаунт единственен по (providerId, accountId)
    providerAccountUq: uniqueIndex("account_provider_account_uniq").on(t.providerId, t.accountId),
    accountUserIdx: index("account_user_id_idx").on(t.userId),
  })
);

/** VERIFICATION */
export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    // Обычно код/токен в связке с идентификатором должен быть уникален
    verificationUnique: uniqueIndex("verification_identifier_value_uniq").on(t.identifier, t.value),
    verificationExpiryIdx: index("verification_expires_at_idx").on(t.expiresAt),
  })
);

/** AGENTS — FIXED */
export const agents = pgTable(
  "agents",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    name: text("name").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    instructions: text("instructions").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    // FIX: опечатка в имени поля/колонки (udpatedAt/udpated_at)
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    agentsUserIdx: index("agents_user_id_idx").on(t.userId),
    // чтобы у одного юзера не было двух агентов с одинаковым именем
    agentsUserNameUq: uniqueIndex("agents_user_id_name_uniq").on(t.userId, t.name),
  })
);

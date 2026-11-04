-- Tabela de OTP de login (pode já existir em ambientes provisionados manualmente).
CREATE TABLE IF NOT EXISTS "login_otps" (
    "email" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "login_otps_pkey" PRIMARY KEY ("email")
);

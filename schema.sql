CREATE TABLE IF NOT EXISTS clinics (
    id                        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name                      VARCHAR NOT NULL,
    phone                     VARCHAR NOT NULL,
    owner_name                VARCHAR NOT NULL,
    owner_email               VARCHAR,
    address                   TEXT,
    is_active                 BOOLEAN DEFAULT false,
    razorpay_subscription_id  VARCHAR,
    created_at                TIMESTAMP WITH TIME ZONE DEFAULT now()
);


CREATE TABLE IF NOT EXISTS patients (
    id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id  UUID REFERENCES clinics(id) ON DELETE CASCADE,
    name       VARCHAR NOT NULL,
    phone      VARCHAR NOT NULL,   -- Format: 919876543210
    age        INTEGER,
    notes      TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);


CREATE TABLE IF NOT EXISTS appointments (
    id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id        UUID REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id       UUID REFERENCES patients(id) ON DELETE CASCADE,
    appointment_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status           VARCHAR DEFAULT 'scheduled',
    reminder_sent    BOOLEAN DEFAULT false,
    notes            TEXT DEFAULT '',
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
);


CREATE TABLE IF NOT EXISTS message_logs (
    id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    patient_phone  VARCHAR,
    message_type   VARCHAR,   
    success        BOOLEAN,
    sent_at        TIMESTAMP WITH TIME ZONE DEFAULT now()
);


CREATE INDEX IF NOT EXISTS idx_appointments_clinic    ON appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status    ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_time      ON appointments(appointment_time);
CREATE INDEX IF NOT EXISTS idx_appointments_reminder  ON appointments(reminder_sent);
CREATE INDEX IF NOT EXISTS idx_patients_clinic        ON patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_message_logs_appt      ON message_logs(appointment_id);

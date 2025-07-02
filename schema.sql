-- PostgreSQL database schema
-- Equivalent to the Prisma schema provided

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Type énuméré pour les statuts de fame
CREATE TYPE fame_status AS ENUM ('Membre', 'Apprecier', 'Reconnu', 'Famous', 'Star', 'Legende');

-- Create Location table
CREATE TABLE "Location" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  city VARCHAR,
  country VARCHAR
);

-- Create User table
CREATE TABLE "User" (
  username VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  firstname VARCHAR NOT NULL,
  lastname VARCHAR NOT NULL,
  password VARCHAR NOT NULL,
  profile_complete BOOLEAN NOT NULL DEFAULT false,
  sexual_preferences VARCHAR[] NOT NULL,
  gender VARCHAR,
  birth_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  biography TEXT,
  profile_picture VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  interests VARCHAR[] NOT NULL,
  location_id UUID UNIQUE REFERENCES "Location" (id),
  authorize_location BOOLEAN NOT NULL DEFAULT false,
  pictures VARCHAR[] NOT NULL DEFAULT '{}'::VARCHAR[],
  fame_score INTEGER NOT NULL DEFAULT 0,
  fame fame_status NOT NULL DEFAULT 'Membre',
  age_min INTEGER,
  age_max INTEGER,
  max_distance INTEGER,
  fame_rating fame_status NOT NULL DEFAULT 'Membre',
  interests_filter VARCHAR[]
);

-- Create junction table for the self-relation (Views)
CREATE TABLE "_Views" (
  "A" VARCHAR NOT NULL REFERENCES "User" (username),
  "B" VARCHAR NOT NULL REFERENCES "User" (username),
  PRIMARY KEY ("A", "B")
);

-- Fix the _Like table
CREATE TABLE "_Like" (
  liker VARCHAR NOT NULL REFERENCES "User" (username),
  liked VARCHAR NOT NULL REFERENCES "User" (username),  -- Corrected column name from liked_username
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (liker, liked)
);

-- Create index for better query performance
CREATE INDEX "Views_A_index" ON "_Views" ("A");
CREATE INDEX "Views_B_index" ON "_Views" ("B");

CREATE TABLE "Block" (
  blocker VARCHAR NOT NULL REFERENCES "User" (username),
  blocked VARCHAR NOT NULL REFERENCES "User" (username),  -- Corrected column name from liked_username
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (blocker, blocked)
);

-- Create Signal table
CREATE TABLE "Signal" (
  signaler VARCHAR NOT NULL REFERENCES "User" (username),
  signaled VARCHAR NOT NULL REFERENCES "User" (username),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (signaler, signaled)
);

-- Create index to improve query performance
CREATE INDEX "Signal_signaler_index" ON "Signal" (signaler);
CREATE INDEX "Signal_signaled_index" ON "Signal" (signaled);

-- Fonction pour supprimer les likes dans les deux sens quand un utilisateur en bloque un autre
CREATE OR REPLACE FUNCTION delete_likes_on_block()
RETURNS TRIGGER AS $$
BEGIN
  -- Supprimer les likes où l'utilisateur bloqué a liké le bloqueur
  DELETE FROM "_Like"
  WHERE liker = NEW.blocked AND liked = NEW.blocker;
  
  -- Supprimer les likes où le bloqueur a liké l'utilisateur bloqué
  DELETE FROM "_Like"
  WHERE liker = NEW.blocker AND liked = NEW.blocked;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger qui se déclenche après l'insertion d'un blocage
CREATE TRIGGER remove_likes_on_block
AFTER INSERT ON "Block"
FOR EACH ROW
EXECUTE FUNCTION delete_likes_on_block();

-- Create trigger to automatically update the updated_at field
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_updated_at
BEFORE UPDATE ON "User"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Index to improve query performance
CREATE INDEX "Like_liker_index" ON "_Like" (liker);
CREATE INDEX "Like_liked_index" ON "_Like" (liked);

-- Create Match table before the function that references it
CREATE TABLE "Match" (
  user1 VARCHAR NOT NULL REFERENCES "User" (username),
  user2 VARCHAR NOT NULL REFERENCES "User" (username),
  matched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user1, user2)
);

-- Function to create a like between two users
CREATE OR REPLACE FUNCTION create_like(liker_username VARCHAR, liked_username VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  already_exists BOOLEAN;
  is_match BOOLEAN DEFAULT FALSE;
BEGIN
  -- Check if the like already exists
  SELECT EXISTS (
    SELECT 1 FROM "_Like" 
    WHERE liker = liker_username AND liked = liked_username
  ) INTO already_exists;
  
  -- If the like already exists, return FALSE
  IF already_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Insert the new like
  INSERT INTO "_Like" (liker, liked, created_at)
  VALUES (liker_username, liked_username, NOW());
  
  -- Check if there's a match
  SELECT EXISTS (
    SELECT 1 FROM "Match" 
    WHERE (user1 = liker_username AND user2 = liked_username) OR 
          (user1 = liked_username AND user2 = liker_username)
  ) INTO is_match;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Index to optimize match searches
CREATE INDEX "Match_user1_index" ON "Match" (user1);
CREATE INDEX "Match_user2_index" ON "Match" (user2);

-- Function to detect matches and insert them into the Match table
CREATE OR REPLACE FUNCTION create_match()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "_Like" WHERE liker = NEW.liked AND liked = NEW.liker
  ) THEN
    INSERT INTO "Match" (user1, user2, matched_at)
    VALUES (LEAST(NEW.liker, NEW.liked), GREATEST(NEW.liker, NEW.liked), NOW())
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function after each insertion in the Like table
CREATE TRIGGER check_for_match
AFTER INSERT ON "_Like"
FOR EACH ROW
EXECUTE FUNCTION create_match();

ALTER TABLE "User" ADD COLUMN is_verified BOOLEAN DEFAULT TRUE;
ALTER TABLE "User" ADD COLUMN verification_token TEXT;

-- Add password reset columns to User table
ALTER TABLE "User" ADD COLUMN reset_password_token TEXT;
ALTER TABLE "User" ADD COLUMN reset_password_expires TIMESTAMP;

-- Fonction pour supprimer un match lorsqu'un des utilisateurs unlike l'autre
CREATE OR REPLACE FUNCTION delete_match_on_unlike()
RETURNS TRIGGER AS $$
BEGIN
  -- Supprimer le match si un des deux utilisateurs unlike l'autre
  DELETE FROM "Match"
  WHERE (user1 = OLD.liker AND user2 = OLD.liked) OR
        (user1 = OLD.liked AND user2 = OLD.liker);
        
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger qui se déclenche lors de la suppression d'un like
CREATE TRIGGER remove_match_on_unlike
BEFORE DELETE ON "_Like"
FOR EACH ROW
EXECUTE FUNCTION delete_match_on_unlike();

-- Fonction pour incrémenter le fame_score lorsqu'un utilisateur reçoit un like
CREATE OR REPLACE FUNCTION increment_fame_score_on_like()
RETURNS TRIGGER AS $$
BEGIN
  -- Incrémenter le fame_score de l'utilisateur qui a reçu le like
  UPDATE "User"
  SET fame_score = fame_score + 1
  WHERE username = NEW.liked;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger qui se déclenche après l'insertion d'un like
CREATE TRIGGER increase_fame_score
AFTER INSERT ON "_Like"
FOR EACH ROW
EXECUTE FUNCTION increment_fame_score_on_like();

-- Fonction pour décrémenter le fame_score lorsqu'un utilisateur perd un like
CREATE OR REPLACE FUNCTION decrement_fame_score_on_unlike()
RETURNS TRIGGER AS $$
BEGIN
  -- Décrémenter le fame_score de l'utilisateur qui perd le like
  UPDATE "User"
  SET fame_score = GREATEST(0, fame_score - 1)  -- Empêcher que le score descende en dessous de 0
  WHERE username = OLD.liked;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger qui se déclenche avant la suppression d'un like
CREATE TRIGGER decrease_fame_score
BEFORE DELETE ON "_Like"
FOR EACH ROW
EXECUTE FUNCTION decrement_fame_score_on_unlike();

-- Fonction pour mettre à jour le statut de fame en fonction du fame_score
CREATE OR REPLACE FUNCTION update_fame_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Déterminer le statut de fame en fonction du fame_score
  NEW.fame := CASE
    WHEN NEW.fame_score < 5 THEN 'Membre'::fame_status
    WHEN NEW.fame_score < 10 THEN 'Apprecier'::fame_status
    WHEN NEW.fame_score < 25 THEN 'Reconnu'::fame_status
    WHEN NEW.fame_score < 50 THEN 'Famous'::fame_status
    WHEN NEW.fame_score < 100 THEN 'Star'::fame_status
    ELSE 'Legende'::fame_status
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement le statut de fame quand le fame_score change
CREATE TRIGGER update_user_fame_status
BEFORE INSERT OR UPDATE OF fame_score ON "User"
FOR EACH ROW
EXECUTE FUNCTION update_fame_status();

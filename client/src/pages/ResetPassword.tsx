import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check } from "lucide-react";
import axios from "axios";
import { authService } from "@/services";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get token from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"loading" | "valid" | "error" | "success">("loading");
  const [message, setMessage] = useState("Vérification du lien...");
  const [passwordError, setPasswordError] = useState("");
  
  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Lien invalide ou expiré. Veuillez demander un nouveau lien de réinitialisation.");
      return;
    }
    
    // Verify token validity
    const verifyToken = async () => {
      try {
        // Just check if token looks valid - actual verification happens on reset
        if (token.length > 20) {
          setStatus("valid");
        } else {
          setStatus("error");
          setMessage("Lien invalide ou expiré. Veuillez demander un nouveau lien de réinitialisation.");
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        setStatus("error");
        setMessage("Lien invalide ou expiré. Veuillez demander un nouveau lien de réinitialisation.");
      }
    };
    
    verifyToken();
  }, [token]);
  
  const validatePassword = () => {
    if (newPassword.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères");
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return false;
    }
    
    setPasswordError("");
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }
    
    try {
      // Send reset request to API
      await authService.resetPassword(token, newPassword);
      setStatus("success");
      setMessage("Votre mot de passe a été réinitialisé avec succès!");
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error: any) {
      console.error("Error resetting password:", error);
      setStatus("error");
      setMessage(
        error.response?.data?.message || 
        "Une erreur est survenue lors de la réinitialisation du mot de passe. Veuillez réessayer."
      );
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Réinitialisation du mot de passe</h1>
            <p className="text-muted-foreground">
              {status === "valid" 
                ? "Créez un nouveau mot de passe pour votre compte." 
                : "Vérification de votre lien de réinitialisation."}
            </p>
          </div>
          
          {status === "loading" && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}
          
          {status === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          
          {status === "success" && (
            <div className="flex flex-col items-center justify-center space-y-2 py-4">
              <div className="bg-green-100 p-2 rounded-full">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium">Mot de passe réinitialisé</h3>
              <p className="text-center text-muted-foreground">
                {message}
              </p>
              <p className="text-sm text-muted-foreground">
                Redirection vers la page de connexion...
              </p>
            </div>
          )}
          
          {status === "valid" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  required 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              
              {passwordError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}
              
              <Button type="submit" className="w-full">
                Réinitialiser le mot de passe
              </Button>
            </form>
          )}
          
          {(status === "error" || status === "success") && (
            <div className="text-center">
              <Button 
                variant="link" 
                onClick={() => navigate("/")}
              >
                Retour à l'accueil
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
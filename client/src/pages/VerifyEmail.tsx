import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import axios from "axios";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get token from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Vérification de votre email...");
  
  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Lien de vérification invalide ou manquant.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/verify-email`, { token });
        setStatus("success");
        setMessage(response.data.message || "Votre email a été vérifié avec succès !");
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } catch (error: any) {
        console.error("Email verification error:", error);
        setStatus("error");
        setMessage(
          error.response?.data?.message || 
          "Échec de la vérification de l'email. Le lien est peut-être expiré ou invalide."
        );
      }
    };

    verifyEmail();
  }, [token, navigate]);
  
  const handleResendVerification = () => {
    // Redirect to main page where user can enter their email to resend
    navigate("/?resendVerification=true");
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Vérification de l'email</h1>
          </div>
          
          {status === "loading" && (
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p>{message}</p>
            </div>
          )}
          
          {status === "success" && (
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-1">Email vérifié avec succès</h3>
                <p className="text-muted-foreground">{message}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Redirection vers la page de connexion...
                </p>
              </div>
              <Button 
                onClick={() => navigate("/")}
                className="mt-2"
              >
                Aller à la connexion
              </Button>
            </div>
          )}
          
          {status === "error" && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
              
              <div className="flex flex-col space-y-2">
                <Button 
                  variant="outline"
                  onClick={handleResendVerification}
                >
                  Demander un nouveau lien
                </Button>
                <Button onClick={() => navigate("/")}>
                  Retour à l'accueil
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
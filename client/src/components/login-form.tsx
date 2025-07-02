import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { RegisterData } from "@/types/auth";
import { Mail, AlertCircle, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { authService } from "@/services";

const LoginForm = () => {
  const location = useLocation();
  const { login } = useAuth();
  
  // Check if we need to show resend verification dialog from URL
  const queryParams = new URLSearchParams(location.search);
  const showResendVerification = queryParams.get("resendVerification") === "true";
  
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isResetSent, setIsResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [loginError, setLoginError] = useState("");
  const [formData, setFormData] = useState({
    email: "mohazerr@outlook.fr",
    username: "mohazerr",
    firstname: "moh",
    lastname: "gam",
    password: "123",
    birth_date: new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0],
  });
  const [birthdateError, setBirthdateError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [usernameImage, setUsernameImage] = useState("");
  const [usernameDesign, setUsernameDesign] = useState<number>(0);

  // Show resend verification dialog if URL parameter is present
  useEffect(() => {
    if (showResendVerification) {
      setIsForgotPasswordOpen(false);
      setIsLoginOpen(false);
      setIsSignupOpen(true);
      setIsVerificationSent(true);
    }
  }, [showResendVerification]);

  const handleUsernameDesignChange = () => {
    setUsernameDesign((prev) => {
      if (prev === 2) return 0;
      return prev + 1;
    });
  };

  useEffect(() => {
    checkUsernameAvailability(formData.username);
  }, [formData.username, usernameDesign]);

  const checkUsernameAvailability = async (username: string) => {
    if (!username) return;
    setUsernameImage(`https://robohash.org/${username}.png?set=${["set1", "set2", "set4"][usernameDesign]}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (e.target.name === "birth_date") {
      validateAge(e.target.value);
    }
  };

  const validateAge = (birth_date: string) => {
    if (!birth_date) {
      setBirthdateError("La date de naissance est requise");
      return false;
    }

    const today = new Date();
    const birthdateDate = new Date(birth_date);
    const age = today.getFullYear() - birthdateDate.getFullYear();
    const monthDiff = today.getMonth() - birthdateDate.getMonth();

    // Si le mois actuel est avant le mois de naissance ou si c'est le même mois mais que le jour actuel est avant le jour de naissance
    const isBeforeBirthday = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdateDate.getDate());

    const actualAge = isBeforeBirthday ? age - 1 : age;

    if (actualAge < 18) {
      setBirthdateError("Vous devez avoir au moins 18 ans pour vous inscrire");
      return false;
    } else {
      setBirthdateError("");
      return true;
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError("");
    
    try {
      await login(formData.email, formData.password);
      setIsLoginOpen(false);
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Check for email verification error
      if (error.response && error.response.status === 401 && 
          error.response.data.message && error.response.data.message.includes("verify")) {
        setLoginError("Votre email n'a pas été vérifié. Veuillez vérifier votre boîte de réception ou demander un nouveau lien de vérification.");
      } else {
        setLoginError("Identifiants incorrects. Veuillez réessayer.");
      }
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Valider l'âge avant de soumettre
    if (!validateAge(formData.birth_date)) {
      toast({
        title: "Erreur",
        description: "Vous devez avoir au moins 18 ans pour vous inscrire.",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await authService.register({
        email: formData.email,
        password: formData.password,
        firstname: formData.firstname,
        lastname: formData.lastname,
        username: formData.username,
        birth_date: formData.birth_date,
      } as RegisterData);
      
      if (success) {
        setIsVerificationSent(true);
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Erreur d'inscription",
        description: error.response?.data?.message || "Une erreur est survenue lors de l'inscription",
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      await authService.forgotPassword(resetEmail);
      toast({
        title: "Email envoyé",
        description: "Si votre email est enregistré, vous recevrez un nouveau lien de vérification.",
      });
      setIsResetSent(true);
    } catch (error) {
      console.error("Reset password error:", error);
      toast({
        title: "Email envoyé",
        description: "Si votre email est enregistré, vous recevrez un nouveau lien de vérification.",
      });
      // We don't show error for security reasons - always behave as if it worked
      setIsResetSent(true);
    }
  };

  const handleResendVerification = async () => {
    try {
      await authService.resendVerification(formData.email);
    } catch (error) {
      console.error("Resend verification error:", error);
      // Error handling is done in the auth context
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 w-full">
      <Card className="w-full sm:w-96 p-4"> 
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">Bienvenue</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Login Dialog */}
          <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1">Se connecter</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Connexion</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required value={formData.email} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input id="password" name="password" type="password" required value={formData.password} onChange={handleInputChange} />
                </div>
                <Button type="submit" className="w-full">
                  Se connecter
                </Button>
                <div className="flex justify-between text-sm">
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsLoginOpen(false);
                      setIsForgotPasswordOpen(true);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                  {loginError && loginError.includes("verify") && (
                    <button 
                      type="button" 
                      onClick={handleResendVerification}
                      className="text-blue-600 hover:underline"
                    >
                      Renvoyer le lien de vérification
                    </button>
                  )}
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Signup Dialog */}
          <Dialog open={isSignupOpen} onOpenChange={(open) => {
            setIsSignupOpen(open);
            if (!open) setIsVerificationSent(false);
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                S'inscrire
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{isVerificationSent ? "Vérifiez votre email" : "Inscription"}</DialogTitle>
              </DialogHeader>
              
              {isVerificationSent ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center space-y-2 py-4">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Mail className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium">Email de vérification envoyé</h3>
                    <p className="text-center text-muted-foreground">
                      Nous avons envoyé un email de vérification à <strong>{formData.email}</strong>. 
                      Veuillez cliquer sur le lien dans l'email pour vérifier votre compte.
                    </p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button 
                      onClick={handleResendVerification}
                      variant="outline"
                    >
                      Renvoyer l'email
                    </Button>
                    <Button 
                      onClick={() => {
                        setIsVerificationSent(false);
                        setIsSignupOpen(false);
                        setIsLoginOpen(true);
                      }}
                    >
                      Aller à la connexion
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" name="email" type="email" required value={formData.email} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="flex items-center gap-2">
                      <Input id="username" name="username" type="text" required value={formData.username} onChange={handleInputChange} />
                      {usernameImage && <img onClick={handleUsernameDesignChange} src={usernameImage} alt="Username" className="w-14 h-14" />}
                    </div>
                    <p className="text-xs text-gray-500">Cliquez sur l'icône pour changer de design</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstname">Prénom</Label>
                    <Input id="firstname" name="firstname" type="text" required value={formData.firstname} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastname">Nom</Label>
                    <Input id="lastname" name="lastname" type="text" required value={formData.lastname} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Date de naissance</Label>
                    <Input
                      id="birth_date"
                      name="birth_date"
                      type="date"
                      required
                      value={formData.birth_date}
                      onChange={handleInputChange}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
                      className="[&::-webkit-calendar-picker-indicator]:bg-white [&::-webkit-calendar-picker-indicator]:p-1 [&::-webkit-calendar-picker-indicator]:rounded"
                    />
                    {birthdateError && <p className="text-sm text-red-500">{birthdateError}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <Input id="signup-password" name="password" type="password" required value={formData.password} onChange={handleInputChange} />
                  </div>
                  <Button type="submit" className="w-full" disabled={!!birthdateError}>
                    S'inscrire
                  </Button>
                </form>
              )}
            </DialogContent>
          </Dialog>
          
          {/* Forgot Password Dialog */}
          <Dialog open={isForgotPasswordOpen} onOpenChange={(open) => {
            setIsForgotPasswordOpen(open);
            if (!open) setIsResetSent(false);
          }}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {isResetSent ? "Email envoyé" : "Réinitialisation du mot de passe"}
                </DialogTitle>
              </DialogHeader>
              
              {isResetSent ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center space-y-2 py-4">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium">Email envoyé</h3>
                    <p className="text-center text-muted-foreground">
                      Si l'adresse <strong>{resetEmail}</strong> est associée à un compte, 
                      vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
                    </p>
                  </div>
                  <Button 
                    onClick={() => {
                      setIsResetSent(false);
                      setIsForgotPasswordOpen(false);
                      setIsLoginOpen(true);
                    }}
                    className="w-full"
                  >
                    Retour à la connexion
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input 
                      id="reset-email" 
                      type="email" 
                      required 
                      value={resetEmail} 
                      onChange={(e) => setResetEmail(e.target.value)} 
                      placeholder="Entrez votre adresse email"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Entrez l'adresse email associée à votre compte et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setIsForgotPasswordOpen(false);
                        setIsLoginOpen(true);
                      }}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" className="flex-1">
                      Envoyer le lien
                    </Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </div>
  );
};

export { LoginForm };
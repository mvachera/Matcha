import Nav from "./Nav";
import PreferencesForms from "./ProfileForm/ProfileForm";

function Profile() {
  return (
    <div className="flex flex-col justify-between w-screen h-full">
      <Nav />
      <PreferencesForms />
    </div>
  );
}

export default Profile;

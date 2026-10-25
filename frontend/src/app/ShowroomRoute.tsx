import { AddVehicleButton, AdminCardActions } from '../features/admin';
import { useAuth } from '../features/auth';
import { ShowroomPage } from '../features/vehicles';

/** Plugs the admin controls into the showroom, so the vehicles feature never imports admin. */
export function ShowroomRoute() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <ShowroomPage />;

  return (
    <ShowroomPage
      headerActions={<AddVehicleButton />}
      renderCardActions={(vehicle) => <AdminCardActions vehicle={vehicle} />}
    />
  );
}

import { RedeemForm } from '../../src/book/RedeemForm';
import { getCurrentUser } from '../../src/auth/session';
import { SitePage } from '../../src/components/SitePage';

// Public — the voucher code is the bearer token, so no login is required to redeem.
export default async function RedeemPage() {
  const user = await getCurrentUser();
  return (
    <SitePage user={user} center>
      <RedeemForm />
    </SitePage>
  );
}

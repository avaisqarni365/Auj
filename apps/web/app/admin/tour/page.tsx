import { requireRole } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { TourScenesAdmin } from '../../../src/admin/TourScenesAdmin';
import { getTourSceneStore } from '../../../src/ritual/tour/tour-scene-store';

// Admin — multilingual CRUD over the Virtual Tour scene catalog (add / edit / reorder / delete).
export default async function TourScenesAdminPage() {
  const user = await requireRole(['ADMIN'], '/admin/tour');
  const scenes = await (await getTourSceneStore()).listScenes();
  return (
    <SitePage user={user}>
      <TourScenesAdmin initial={scenes} />
    </SitePage>
  );
}

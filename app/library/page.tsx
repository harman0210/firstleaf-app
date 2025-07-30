import { Suspense } from "react";
import LibraryPage from "./LibraryPage"; 
export default function LibraryWrapperPage() {
  return (
    <Suspense fallback={<div>Loading library...</div>}>
      <LibraryPage />
    </Suspense>
  );
}

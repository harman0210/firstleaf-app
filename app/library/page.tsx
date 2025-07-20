import { Suspense } from "react";
//import LibraryPage from "./LibraryPage";
import LibraryPage from "./LibraryPage"; // ✅ this is correct if the file is named LibraryPage.tsx


export default function LibraryWrapperPage() {
  return (
    <Suspense fallback={<div>Loading library...</div>}>
      <LibraryPage />
    </Suspense>
  );
}

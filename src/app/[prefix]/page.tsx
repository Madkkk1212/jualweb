import { notFound, redirect } from "next/navigation";

// Daftar prefix workspace yang valid
const VALID_PREFIXES = ["madk"];

export default function PrefixPage({ params }: { params: { prefix: string } }) {
  if (VALID_PREFIXES.includes(params.prefix)) {
    // Prefix valid → arahkan ke login workspace
    redirect("/workspace/login");
  }
  // Prefix tidak dikenal → tampilkan 404
  notFound();
}

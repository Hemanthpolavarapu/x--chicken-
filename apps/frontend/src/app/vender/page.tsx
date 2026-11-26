import { redirect } from "next/navigation";

export default function VenderRootRedirect() {
  redirect("/vendor/dashboard");
}

import { redirect } from "next/navigation";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminSignInPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const requestedRedirect = params.redirect_url;
  const redirectValue = Array.isArray(requestedRedirect) ? requestedRedirect[0] : requestedRedirect;

  const returnTo =
    redirectValue && redirectValue.startsWith("/")
      ? `https://www.hautlabmx.com${redirectValue}`
      : "https://www.hautlabmx.com/admin/whatsapp";

  const accountPortalUrl = new URL("https://accounts.hautlabmx.com/sign-in");
  accountPortalUrl.searchParams.set("redirect_url", returnTo);

  redirect(accountPortalUrl.toString());
}

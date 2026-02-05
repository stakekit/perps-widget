import { useRouter } from "@tanstack/react-router";
import { Button } from "@yieldxyz/perps-common/components";
import { ChevronLeft } from "lucide-react";

export function BackButton() {
  const { history } = useRouter();

  return (
    <Button variant="ghost" size="icon" onClick={() => history.go(-1)}>
      <ChevronLeft className="size-6 text-gray-2" />
    </Button>
  );
}

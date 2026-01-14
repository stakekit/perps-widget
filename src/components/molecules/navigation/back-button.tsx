import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackButton() {
  const { history } = useRouter();

  return (
    <Button variant="ghost" size="icon" onClick={() => history.go(-1)}>
      <ChevronLeft className="size-6 text-gray-2" />
    </Button>
  );
}

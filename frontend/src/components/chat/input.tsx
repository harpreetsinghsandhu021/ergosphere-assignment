import type { Dispatch, SetStateAction } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "../ui/input-group";
import { Separator } from "../ui/separator";

import { IconPlus } from "@tabler/icons-react";
import { ArrowUpIcon } from "lucide-react";

const Input = ({
  onClick,
  input,
  setInput,
}: {
  onClick: () => void;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
}) => {
  return (
    <InputGroup className="dark:bg-black">
      <InputGroupTextarea
        value={input}
        onInput={(e) => setInput(e.currentTarget.value)}
        placeholder="Ask, Search or Chat..."
      />
      <InputGroupAddon align="block-end">
        <InputGroupButton
          variant="outline"
          className="rounded-full"
          size="icon-xs"
        >
          <IconPlus />
        </InputGroupButton>

        <InputGroupText className="ml-auto">30% used</InputGroupText>
        <Separator orientation="vertical" className="h-4" />
        <InputGroupButton
          variant="default"
          className="rounded-full"
          size="icon-xs"
          onClick={onClick}
        >
          <ArrowUpIcon />
          <span className="sr-only">Send</span>
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
};

export default Input;

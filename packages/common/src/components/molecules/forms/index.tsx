import type { FormReact } from "@lucas-barake/effect-form-react";
import { Option } from "effect";
import { Text } from "../../ui/text";

export const AmountField: FormReact.FieldComponent<string> = ({ field }) => {
  const onChange: (typeof field)["onChange"] = (newValue) => {
    const value = newValue.replace(/[^0-9.,]/g, "").replace(/\$/g, "");
    const parts = value.split(/[.,]/);
    if (parts.length > 2) return;

    field.onChange(value);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center">
        <input
          inputMode="decimal"
          value={`$${field.value}`}
          onFocus={() => {
            if (field.value === "0") {
              onChange("");
            }
          }}
          onBlurCapture={() => {
            if (field.value === "" || field.value.startsWith("00")) {
              onChange("0");
            }
          }}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          pattern="^(?!0\d)\d*([.,])?(\d+)?$"
          minLength={1}
          maxLength={79}
          onBlur={field.onBlur}
          placeholder="0"
          className="text-white text-[44px] font-semibold tracking-[-1.76px] leading-none bg-transparent border-none outline-none placeholder:text-gray-4 min-w-[1ch] caret-accent-green text-center max-w-[10ch]"
        />
      </div>
      {Option.isSome(field.error) && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-red/10 border border-accent-red/20 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="size-4 rounded-full bg-accent-red/20 flex items-center justify-center">
            <Text
              as="span"
              variant="inherit"
              className="text-accent-red text-xs font-bold"
            >
              !
            </Text>
          </div>
          <Text
            as="span"
            variant="inherit"
            className="text-accent-red text-sm font-medium"
          >
            {field.error.value}
          </Text>
        </div>
      )}
    </div>
  );
};

import { useState } from "react";
import { Button } from "@expo/ui";
import { DropdownMenu, DropdownMenuItem, Text } from "@expo/ui/jetpack-compose";
import type { SettingsPickerProps } from "./SettingsPicker";

export default function SettingsPicker<T extends string>({
    value,
    onChange,
    options,
    testID,
}: SettingsPickerProps<T>) {
    const [expanded, setExpanded] = useState(false);
    return (
        <DropdownMenu
            expanded={expanded}
            onDismissRequest={() => setExpanded(false)}
        >
            <DropdownMenu.Trigger>
                <Button
                    testID={testID}
                    variant="text"
                    label={`${options.find((option) => option.value === value)?.label ?? value} ▾`}
                    onPress={() => setExpanded(true)}
                />
            </DropdownMenu.Trigger>
            <DropdownMenu.Items>
                {options.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        onClick={() => {
                            setExpanded(false);
                            onChange(option.value);
                        }}
                    >
                        <DropdownMenuItem.Text>
                            <Text>{option.label}</Text>
                        </DropdownMenuItem.Text>
                        {option.value === value && (
                            <DropdownMenuItem.TrailingIcon>
                                <Text>✓</Text>
                            </DropdownMenuItem.TrailingIcon>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenu.Items>
        </DropdownMenu>
    );
}

import { Picker } from "@expo/ui";
import { Picker as LabeledPicker, Text } from "@expo/ui/swift-ui";
import { pickerStyle, tag } from "@expo/ui/swift-ui/modifiers";

export type SettingsPickerProps<T extends string> = {
    value: T;
    onChange: (value: T) => void;
    options: { value: T; label: string }[];
    testID: string;
    // Form row label; SwiftUI stacks it above the value at accessibility text sizes.
    label?: string;
};

export default function SettingsPicker<T extends string>({
    value,
    onChange,
    options,
    testID,
    label,
}: SettingsPickerProps<T>) {
    if (label) {
        return (
            <LabeledPicker
                label={label}
                selection={value}
                onSelectionChange={onChange}
                modifiers={[pickerStyle("menu")]}
                testID={testID}
            >
                {options.map((option) => (
                    <Text key={option.value} modifiers={[tag(option.value)]}>
                        {option.label}
                    </Text>
                ))}
            </LabeledPicker>
        );
    }
    return (
        <Picker selectedValue={value} onValueChange={onChange} testID={testID}>
            {options.map((option) => (
                <Picker.Item key={option.value} {...option} />
            ))}
        </Picker>
    );
}

import { Picker } from "@expo/ui";

export type SettingsPickerProps<T extends string> = {
    value: T;
    onChange: (value: T) => void;
    options: { value: T; label: string }[];
    testID: string;
};

export default function SettingsPicker<T extends string>({
    value,
    onChange,
    options,
    testID,
}: SettingsPickerProps<T>) {
    return (
        <Picker selectedValue={value} onValueChange={onChange} testID={testID}>
            {options.map((option) => (
                <Picker.Item key={option.value} {...option} />
            ))}
        </Picker>
    );
}

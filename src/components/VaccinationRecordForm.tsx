"use client";

import {Calendar} from "@/components/ui/calendar";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {cn} from "@/lib/utils";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useState} from "react";
import {format} from "date-fns";
import {VaccinationScheduleEntry} from "@/services/vaccination-schedule";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

const FormSchema = z.object({
    vaccineName: z.string().min(2, {
        message: "Aşı adı en az 2 karakter olmalıdır.",
    }),
    date: z.date({
        required_error: "Bir doğum tarihi gereklidir.",
    }),
    batchNumber: z.string().optional(),
    notes: z.string().optional(),
})

interface VaccinationRecordFormProps {
    onSubmit: (values: z.infer<typeof FormSchema>) => void;
    initialValues?: Partial<z.infer<typeof FormSchema>>;
    vaccinationOptions: VaccinationScheduleEntry[];
}

export function VaccinationRecordForm({onSubmit, initialValues, vaccinationOptions}: VaccinationRecordFormProps) {
    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: initialValues || {
            vaccineName: "",
            date: new Date(),
            batchNumber: "",
            notes: "",
        },
    })

    function handleVaccinationSubmit(values: z.infer<typeof FormSchema>) {
        onSubmit(values);
        form.reset();
    }


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleVaccinationSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="vaccineName"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Aşı adı</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Bir aşı seçin"/>
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {vaccinationOptions.map((vaccine) => (
                                        <SelectItem key={vaccine.vaccineName} value={vaccine.vaccineName}>
                                            {vaccine.vaccineName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                Aşının adını seçin.
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="date"
                    render={({field}) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Aşılama tarihi</FormLabel>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[240px] pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Bir tarih seçin</span>
                                            )}
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date > new Date()
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormDescription>
                                Aşının yapıldığı tarihi girin.
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="batchNumber"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Parti numarası</FormLabel>
                            <FormControl>
                                <Input placeholder="Parti numarasını girin" {...field} />
                            </FormControl>
                            <FormDescription>
                                Aşının parti numarasını girin.
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="notes"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Notlar</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Eklemek istediğiniz notlar var mı?"
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Hatırlamak istediğiniz ek notlar.
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <Button type="submit">Kaydet</Button>
            </form>
        </Form>
    )
}



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

const FormSchema = z.object({
    vaccineName: z.string().min(2, {
        message: "Vaccine name must be at least 2 characters.",
    }),
    date: z.date({
        required_error: "A date of birth is required.",
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
                            <FormLabel>Vaccine name</FormLabel>
                            <FormControl>
                                <Input placeholder="DTaP" {...field} />
                            </FormControl>
                            <FormDescription>
                                Enter the name of the vaccine.
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
                            <FormLabel>Date of vaccination</FormLabel>
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
                                                <span>Pick a date</span>
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
                                Enter the date when vaccination was given.
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
                            <FormLabel>Batch number</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter batch number" {...field} />
                            </FormControl>
                            <FormDescription>
                                Enter the batch number of the vaccine.
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
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Any additional notes?"
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Any additional notes to remember.
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    )
}

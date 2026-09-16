import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'

const schema = z.object({
  project: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email')
})

type FormValues = z.infer<typeof schema>

/**
 * Zod + React Hook Form demo — type-safe validation with zero
 * boilerplate. Copy this block into any consumer page.
 */
export function ExampleForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { project: '', email: '' }
  })

  const onSubmit = async (values: FormValues): Promise<void> => {
    // Replace with your real persistence / IPC call.
    await new Promise((r) => setTimeout(r, 400))
    console.log('form submitted', values)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="project">Project name</Label>
        <Input id="project" placeholder="My app" {...register('project')} />
        {errors.project && <p className="text-xs text-destructive">{errors.project.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Saving…' : 'Save'}
      </Button>
    </form>
  )
}

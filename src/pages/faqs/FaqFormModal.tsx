import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
} from '@nextui-org/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { faqSchema, type FaqFormValues } from '@/schemas'
import type { Faq } from '@/types'

type FaqFormModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: FaqFormValues) => Promise<void>
  initial?: Faq | null
}

export default function FaqFormModal({ isOpen, onClose, onSubmit, initial }: FaqFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FaqFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: { question: '', answer: '' },
  })

  useEffect(() => {
    if (isOpen) {
      reset({ question: initial?.question ?? '', answer: initial?.answer ?? '' })
    }
  }, [isOpen, initial, reset])

  const submit = async (values: FaqFormValues) => {
    await onSubmit(values)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center" size="lg">
      <ModalContent>
        <form onSubmit={handleSubmit(submit)} noValidate>
          <ModalHeader>{initial ? 'تعديل سؤال' : 'إضافة سؤال'}</ModalHeader>
          <ModalBody className="flex flex-col gap-4">
            <Input
              label="السؤال"
              variant="bordered"
              isInvalid={!!errors.question}
              errorMessage={errors.question?.message}
              {...register('question')}
            />
            <Textarea
              label="الإجابة"
              variant="bordered"
              minRows={4}
              isInvalid={!!errors.answer}
              errorMessage={errors.answer?.message}
              {...register('answer')}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              إلغاء
            </Button>
            <Button type="submit" color="primary" isLoading={isSubmitting}>
              حفظ
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

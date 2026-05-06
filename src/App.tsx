import { useState } from 'react'
import { useQueryParams } from './hooks/useQueryParams'
import { StudentForm } from './components/StudentForm'
import { CertificatePreview } from './components/CertificatePreview'
import { InvalidUrlScreen } from './components/InvalidUrlScreen'

type StudentData = {
  name: string
  email: string
}

function App() {
  const paramsState = useQueryParams()
  const [student, setStudent] = useState<StudentData | null>(null)

  if (paramsState.status === 'invalid') {
    return <InvalidUrlScreen missing={paramsState.missing} />
  }

  if (!student) {
    return (
      <StudentForm
        course={paramsState.params}
        onSubmit={(data) => {
          console.info('Certificado solicitado para:', data.email)
          setStudent(data)
        }}
      />
    )
  }

  return (
    <CertificatePreview
      course={paramsState.params}
      studentName={student.name}
      onBack={() => setStudent(null)}
    />
  )
}

export default App

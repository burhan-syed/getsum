type ExpenseEditPageProps = {
  params: {
    groupId: string
  }
}

export default function ExpenseEditPage({params}: ExpenseEditPageProps) {
  return <div>group {params.groupId} expense edit</div>
}
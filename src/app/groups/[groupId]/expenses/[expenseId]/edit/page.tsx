type ExpensePageProps = {
  params: {
    groupId: string
    expenseId: string
  }
}

export default function ExpenseEditPage({params}: ExpensePageProps) {
  return <div>group {params.groupId} expense edit {params.expenseId}</div>
}
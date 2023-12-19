type ExpensePageProps = {
  params: {
    groupId: string
    expenseId: string
  }
}

export default function ExpensePage({params}: ExpensePageProps) {
  return <div>group {params.groupId} expense {params.expenseId}</div>
}
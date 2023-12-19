type GroupPageProps = {
  params: {
    groupId: string
  }
}

export default function GroupPage({params}: GroupPageProps) {
  return <div>group {params.groupId}</div>
}
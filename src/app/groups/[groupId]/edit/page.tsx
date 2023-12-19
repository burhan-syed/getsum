type GroupEditPageProps = {
  params: {
    groupId: string
  }
}

export default function GroupEditPage({params}: GroupEditPageProps) {
  return <div>group {params.groupId} edit</div>
}
const compareIds = (id1: string | number | undefined, id2: string | number | undefined) => {
  if (!id1 || !id2) {
    return false
  }
  return id1.toString() === id2.toString()
}

export default compareIds


export const fetch = (url) => {
  return window.fetch(`http://localhost:4000/admin/crud/${url}`, {
    mode: 'cors',
    headers: {
      'Authorization': 'Joshua'
    }
  })
    .then((data) => {
      return data.json()
    })
}

export const patch = (url, data) => {
  return window.fetch(`http://localhost:4000/admin/crud/${url}`, {
    body: JSON.stringify(data),
    method: 'PATCH',
    mode: 'cors',
    headers: {
      'Authorization': 'Joshua'
    }
  })
    .then((data) => {
      return data.json()
    })
}

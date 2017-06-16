const fs = require('fs')
const jwt = require('jwt-simple')

const pem_file = '/path/to/github.pem' // the absolute path to your Application Pem Certificate issued by GitHub
const integration_id = 0               // GitHub Application Integration ID
const installation_id = 0              // once installed on an organization. The Organization Integration ID
const expire_seconds = 60              // number of seconds the jwt token expires (max ~600 but not designated by GitHub)
const slug = 'owner/repo'              // name of repo for demo purposes
const privateKey = fs.readFileSync(pem_file)

// Step 1) Create an integrations access token
get_access_token(installation_id).then((access_token) =>
  // Step 2) use token to interact with github api
  fetch(`https://api.github.com/repos/${slug}`, {
    headers: new Headers({
      Accept: 'application/vnd.github.machine-man-preview+json',
      Authorization: `Bearer ${access_token}`
    })
  }).then((res) => res.json())
).then(console.log)

function get_access_token (id) {
  return fetch(`https://api.github.com/installations/${id}/access_tokens`, {
    method: 'POST',
    headers: new Headers({
      Accept: 'application/vnd.github.machine-man-preview+json',
      Authorization: `Bearer ${integration_token()}`
    })
  }).then((res) => res.json())
    .then((json) => json.token)
}

function integration_token () {
  const now = Math.round(Date.now() / 1000)
  return jwt.encode({
    iat: now,
    exp: now + expire_seconds,
    iss: integration_id
  }, privateKey, 'RS256')
}

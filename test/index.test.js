const nock = require('nock')
const sinon = require('sinon')
const { Probot } = require('probot')
const argocdBot = require('..')
const payload = require('./fixtures/issue_comment.created.json')

nock.disableNetConnect()

describe('argo-cd-bot', () => {
    let probot
    
    beforeEach(() => {
        probot = new Probot({})
        const app = probot.load(argocdBot)
        app.app = () => 'test'

        // node env variables
        process.env.ARGO_CD_API_TOKEN = 'token';
        process.env.ARGO_CD_SERVER_IP = '1.2.3.4'
         
    })

    // I'm not sure how to properly fix this
    test('diff comment posted on PR', async() => {
        nock('https://api.github.com')
            .post('/app/installations/2/access_tokens')
            .reply(200, {token: 'test'})

        const branch = "newBranch"
        nock('https://api.github.com').get('/repos/robotland/test/pulls').reply(200, {"data": {"number": 109, "head": { "ref": branch}}})

        const child_process = require('child_process')
        const execStub = sinon.stub(child_process, 'exec')
        execStub.yields(false)

        // TODO fix me
        nock('https://1.2.3.4').get('/api/v1/applications?fields=items.metadata.name,items.spec.source.path,items.spec.source.repoURL')
            .reply(200, {"items": {"metadata": { "name": "app1" }, "spec": { "source": { "path": "dir1" } } } })

        await probot.receive({name: 'issue_comment', payload})
    })

    /*
  test('diff comment posted on multiple PR, first PR should hold the lock, preventing the second one from being diff\'d', async () => {
    nock('https://api.github.com')
      .post('/app/installations/2/access_tokens')
      .reply(200, {token: 'test'})
    
    let sandbox = sinon.createSandbox()
    const child_process = require('child_process')
    sandbox.stub(child_process, 'exec').returns({'stdout': 'test'})
    await probot.receive({name: 'issue_comment', payload})

    await probot.receive({name: 'issue_comment', payload})
    sandbox.restore()
  })
  */

})

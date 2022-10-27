import React, { Fragment, useState, useRef, useEffect } from 'react';
import { Form, Input, Button, Modal, Select } from 'antd';
import Services from './Services';
import generatedGitInfo from './generatedGitInfo.json';

const App = () => {
  const [selectedFiles, setSelectedFiles] = useState({});
  const [modalVisible, setModalVisible] = useState(true);
  const [quickModal, setQuickModal] = Modal.useModal();
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [dataFormLoading, setDataFormLoading] = useState(false);
  const [emmDataSent, setEmmDataSent] = useState(false);
  const [clients, setClients] = useState();
  const [inputAsset, setInputAsset] = useState();
  const [subClients, setSubClients] = useState();
  const [campaigns, setCampaigns] = useState();
  const [saveState, setSaveState] = useState({ saving: false, savable: false });
  const [dataFormValues, setDataFormValues] = useState({
    runrunitTask: '',
    client: '',
    subClient: '',
    campaign: '',
    emmTitle: '',
    customClient: undefined,
    customCampaign: undefined,
    customSubClient: undefined,
  });
  const [currTd, setCurrTd] = useState({});
  const [urlValue, setUrlValue] = useState();
  // const [path, setPath] = useState([]);
  const [hasLink, setHasLink] = useState(false);
  const [submitError, setSubmitError] = useState();
  const [bgColor, setBgColor] = useState('#d0d4d7');
  const [caughtTable, setCaughtTable] = useState();
  const [tdIndex, setTdIndex] = useState();
  const [generate, setGenerateState] = useState()

  const tableRef = useRef(null);
  const linkRef = useRef(null);
  const tdBgRef = useRef(null);

  const { Item } = Form
  const { Option } = Select

  const downloadFile = async path => {
    const response = await Services.downloadFile(path)
    if (response.error) {
      defaultError()
    }
    else {
      var
        blob = new Blob([response.data],
          { type: "text/plain;charset=utf-8" }),
        a = document.createElement("a"),
        url = URL.createObjectURL(blob),
        filename = 'index.html'

      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    }
  }

  const handleTdEdit = () => {
    document.querySelectorAll('.edit-btn').forEach((btn, i) => {
      btn.addEventListener('click', e => {
        setCurrTd(e.path[1])
        setUrlValue(e.path[1].childNodes[1].href)
        // setPath(e.path)
        setHasLink(e.path[1].childNodes[1].href)
        setLinkModalVisible(true)
        setTdIndex(i)
        linkRef.current.focus()
        linkRef.current.value = urlValue || e.path[1].childNodes[1].href
      })
    })
  }

  const submitForm = async () => {
    const sortFilesByName = (a, b) => a.name < b.name ? -1 : 1

    const fd = new FormData();
    const keys = Object.keys(selectedFiles)
    let sortedArray = []
    for (let key of keys) {
      sortedArray.push(selectedFiles[key])
    }
    sortedArray.sort(sortFilesByName)

    for (let i = 0; i < sortedArray.length; i++)
      fd.append('files', sortedArray[i]);
    setGenerateState('generating')
    const response = await Services.generateEmm(fd)
    setGenerateState()
    if (!response.error) {
      tdBgRef.current.innerHTML = response.data;
      setCaughtTable(true)
      handleTdEdit()
      setSaveState({ saving: false, savable: true })
    }
  }

  const submitDataForm = async () => {
    setDataFormLoading(true);
    const response = await Services.submitInfoForm(dataFormValues)

    if (response.error) {
      if (response.message)
        setSubmitError(response)
      setDataFormLoading(false);
      setDataFormLoading(false);
      setEmmDataSent(true)
    }
    else {
      setDataFormLoading(false);
      setModalVisible(false);
      setDataFormLoading(false);
      setEmmDataSent(true)
    }
  }

  const filesHandler = (event) => {
    setSelectedFiles(event.target.files);
  }

  const fetchCampaigns = async (subClient) => {
    setCampaigns(undefined)
    if (subClient !== 'outro') {
      const response = await Services.getCampaigns(dataFormValues.client, subClient)
      if (response.error) {
        setDataFormValues({ ...dataFormValues, campaign: 'Erro ao carregar campanhas' })
        setCampaigns([{ value: 'Erro ao carregar campanhas', disabled: true }])
      }
      else
        setCampaigns(mapSelectOptions(response.data))
    }
    else
      setCampaigns([])
  }

  const fetchSubClients = async (client) => {
    setSubClients(undefined)
    if (client !== 'outro') {
      const response = await Services.getSubClients(client)
      if (response.error) {
        setDataFormValues({ ...dataFormValues, subClient: 'Erro ao carregar subclientes' })
        setSubClients([{ value: 'Erro ao carregar subclientes', disabled: true }])
      }
      else
        setSubClients(mapSelectOptions(response.data))
    }
    else
      setSubClients([])
  }

  const handleDataFormInput = (value, name) => {
    if (name === 'client' && dataFormValues.customClient)
      setDataFormValues({ ...dataFormValues, [name]: value, 'customClient': undefined });
    else {
      setDataFormValues({ ...dataFormValues, [name]: value });
      if (name === 'client')
        fetchSubClients(value)
      else if (name === 'subClient')
        fetchCampaigns(value)
    }
  }

  const mapSelectOptions = options => {
    return options.map(client => {
      return {
        value: client,
        disabled: false,
      }
    })
  }

  const fetchClients = async () => {
    const response = await Services.getClients()
    if (!response.error) {
      setClients(mapSelectOptions(response.data))
      return
    }
    setDataFormValues({ ...dataFormValues, client: 'Erro ao carregar clientes' })
    setClients([{ value: 'Erro ao carregar clientes', disabled: true }])
  }

  const fetchAsset = async () => {
    const fd = new FormData();
    fd.append('asset', inputAsset)

    const response = await Services.getAsset(fd)
    if (!response.error) {
      setUrlValue(response.data)
      return response.data
    }
  }

  const linkBtn = async () => {
    let newUrlValue = urlValue

    if (inputAsset)
      newUrlValue = await fetchAsset()

    if (newUrlValue && !hasLink) {
      currTd.removeChild(document.querySelectorAll('.edit-btn')[tdIndex])
      currTd.innerHTML = `<span class="edit-btn">Editar</span><a class="aqui" href="${newUrlValue}" target="_blank">${currTd.innerHTML}</a>`
    }
    else if (newUrlValue && hasLink) {
      const imgTag = document.querySelectorAll('.editable  img')[tdIndex].outerHTML
      currTd.innerHTML = `<span class="edit-btn">Editar</span><a class="aqui" href="${newUrlValue}" target="_blank">${imgTag}</a>`
      document.querySelectorAll('.editable')[tdIndex].childNodes[1].innerHTML = imgTag
    }
    else if (newUrlValue === '' && hasLink) {
      currTd.innerHTML = `${currTd.childNodes[0].outerHTML}${currTd.childNodes[1].childNodes[0].outerHTML}`
    }

    setUrlValue()
    setCurrTd()
    setHasLink(false)
    setLinkModalVisible(false)
    setTdIndex()
    handleTdEdit()
    setInputAsset()
  }

  const saveFinalFile = async () => {
    document.querySelectorAll('.edit-btn').forEach(e => e.remove())
    setSaveState({ saving: true, savable: false })

    const response = await Services.saveFinaleFile({ html: tableRef.current.innerHTML })
    const tds = document.querySelectorAll('td.editable')
    tds.forEach(td => {
      td.innerHTML = '<span class="edit-btn">Editar</span>' + td.innerHTML
    })
    handleTdEdit()
    if (response.error) {
      setSaveState({ saving: false, savable: true })
    }
    else {
      setSaveState({ saving: false, savable: true })
      const config = {
        title: 'Email salvo com sucesso!',
        content: (
          <Fragment>
            <a target='_blank' href={response.data.fileAdress}>Visualizar Email</a>
            <br />
            <Button onClick={() => downloadFile(response.data.fileAdress)}>
              {/* <a href={response.data.fileAdress} download target="_blank"> */}
              Baixar
              {/* </a> */}
            </Button>
          </Fragment>
        ),
      };
      quickModal.success(config)
    }
  }

  const handleInputFile = e => {
    setInputAsset(e.target.files[0])
    setUrlValue()
  }

  const handlebtnAnchor = e => {
    setUrlValue(e.target.value)
    setInputAsset()
  }

  useEffect(() => {
    fetchClients()
  }, [])

  return (
    <Fragment>
      <Modal
        closable={false}
        title="Dados do E-mail"
        visible={modalVisible}
        footer={[
          <Button loading={dataFormLoading} disabled={dataFormLoading} form="dataForm" key="submit" htmlType="submit">
            {dataFormLoading ? 'Enviando' : 'Enviar'}
          </Button>
        ]}
      >
        <Form
          id='dataForm'
          onFinish={submitDataForm}
          layout="vertical"
        >

          <Item label='Cliente' rules={[{ required: true, message: 'Selecione um cliente' }]} >
            <Select
              name='client'
              disabled={(!clients) || (clients[0] && clients[0].disabled)}
              loading={!clients}
              value={dataFormValues.client}
              onChange={e => handleDataFormInput(e, 'client')}
            >
              <Option value="" disabled>
                {clients ? 'Selecione um cliente' : 'Carregando clientes'}
              </Option>
              {clients && clients.map(client => (
                <Option value={client.vlue} key={client.value}>
                  {client.value}
                </Option>
              ))}
              <Option value="outro">
                Novo cliente
              </Option>
            </Select>
          </Item>

          {dataFormValues.client === 'outro' &&
            <Item label='Nome do novo cliente' rules={[{ required: true, message: 'Preencha este campo' }]} name="customClient">
              <Input
                value={dataFormValues.customClient}
                placeholder="Novo cliente"
                onChange={e => handleDataFormInput(e.target.value, e.target.id)}
              />
            </Item>
          }

          <Item label='Subcliente' rules={[{ required: true, message: 'Selecione um subcliente' }]}>
            <Select
              name='subClient'
              disabled={!subClients || (subClients[0] && subClients[0].disabled)}
              loading={dataFormValues.client && !subClients}
              value={dataFormValues.subClient}
              onChange={e => handleDataFormInput(e, 'subClient')}
            >
              <Option value="" disabled>
                {
                  dataFormValues.client ?
                    subClients ? 'Selecione um subcliente' : 'Carregando subclientes'
                    :
                    'Selecione um cliente primeiro'
                }
              </Option>
              {subClients && subClients.map(sub => (
                <Option value={sub.value} key={sub.value}>
                  {sub.value}
                </Option>
              ))}
              <Option value="outro">
                Novo subcliente
              </Option>
            </Select>
          </Item>

          {dataFormValues.subClient === 'outro' &&
            <Item label='Nome do novo subcliente' rules={[{ required: true, message: 'Preencha este campo' }]} name="customSubClient">
              <Input
                value={dataFormValues.customClient}
                placeholder="Geral"
                onChange={e => handleDataFormInput(e.target.value, e.target.id)}
              />
            </Item>
          }

          <Item label='Campanha' rules={[{ required: true, message: 'Selecione uma campanha' }]}>
            <Select
              disabled={!campaigns || (campaigns[0] && campaigns[0].disabled)}
              name='campaign'
              loading={dataFormValues.subClient && !campaigns}
              value={dataFormValues.campaign}
              onChange={e => handleDataFormInput(e, 'campaign')}
            >
              <Option value="" disabled>
                {
                  dataFormValues.subClient ?
                    campaigns ? 'Selecione uma campanha' : 'Carregando campanhas'
                    :
                    'Selecione um subcliente primeiro'
                }
              </Option>
              {campaigns && campaigns.map(camp => (
                <Option value={camp.value} key={camp.value}>
                  {camp.value}
                </Option>
              ))}
              <Option value="outro">
                Nova campanha
              </Option>
            </Select>
          </Item>

          {dataFormValues.campaign === 'outro' &&
            <Item label='Nome da nova campanha' rules={[{ required: true, message: 'Preencha este campo' }]} name="customCampaign">
              <Input
                value={dataFormValues.customCampaign}
                placeholder="Geral"
                onChange={e => handleDataFormInput(e.target.value, e.target.id)}
              />
            </Item>
          }

          <Item
            validateStatus={submitError && 'error'}
            help={submitError && submitError.message}
            addonAfter
            label='Número e nome da tarefa'
            rules={[{ required: true, message: 'Preencha este campo' }]}
            name="runrunitTask"
          >
            <Input
              value={dataFormValues.runrunitTask}
              placeholder="1234 - Nome da tarefa - Cliente"
              onChange={e => handleDataFormInput(e.target.value, e.target.id)}
            />
          </Item>

          <Item addonAfter label='Título do e-mail' rules={[{ required: true, message: 'Preencha este campo' }]} name="emmTitle">
            <Input
              value={dataFormValues.runrunitTask}
              placeholder="Cliente - Nome da campanha"
              onChange={e => handleDataFormInput(e.target.value, e.target.id)}
            />
          </Item>
        </Form>
      </Modal>


      <Modal
        title="Link do botão"
        visible={linkModalVisible}
        onCancel={() => setLinkModalVisible(false)}
        footer={[
          <Button form="linkForm" key="submit" htmlType="submit">
            Linkar
          </Button>
        ]}
      >
        <Form
          id='linkForm'
          onFinish={linkBtn}
          layout="vertical"
        >
          <Item label='Link do botão' >
            <Input
              ref={linkRef}
              value={urlValue}
              type='text'
              placeholder="http://example.com"
              onChange={e => handlebtnAnchor(e)}
            />
          </Item>
          <p>ou subir anexo:</p>
          <Item label='Arquivo do botão' name="asset">
            <Input
              type='file'
              onChange={handleInputFile}
              value={inputAsset}
              defaultValue={inputAsset}
            />
          </Item>
        </Form>
      </Modal>

      {setQuickModal}

      <div className='d-flex justify-between'>
        <h4>
          Editor de EMM
        </h4>

        <span>
          Commit: <b>{generatedGitInfo.gitCommitHash}</b>
        </span>
      </div>

      {!modalVisible &&
        <Fragment>
          <h1 style={{ 'marginBottom': '0' }}>
            {dataFormValues.customClient ? dataFormValues.customClient : dataFormValues.client}
          </h1>
          <h3>
            {dataFormValues.runrunitTask}
          </h3>
        </Fragment>
      }
      <Form
        onFinish={submitForm}
      >
        <Item name="files" rules={[{ required: true, message: 'Insira as imagens' }]}>
          <Input value={selectedFiles} onChange={filesHandler} multiple type="file" />
        </Item>

        <Item>
          <Button
            loading={generate == "generating"}
            disabled={!emmDataSent || !selectedFiles.length || generate == "generating"}
            htmlType='submit'>
            {generate === "generating" ? 'Gerando email...' : 'Gerar email'}
          </Button>
        </Item>
      </Form>
      <Item className='color-controller' label="Cor de fundo">
        <Input className='limited-input' name="bgColor" value={bgColor} disabled={!caughtTable} onChange={e => setBgColor(e.target.value)} type="color" />

        <Input className='limited-input' name="bgColor" value={bgColor} disabled={!caughtTable} onChange={e => setBgColor(e.target.value)} type="text" />
      </Item>

      <main ref={tableRef}>
        <table align="center" width="100%" height="100%" style={{ margin: "auto" }} border="0" cellSpacing="0" cellPadding="0" >
          <tr>
            <td ref={tdBgRef} bgcolor={bgColor}></td>
          </tr>
        </table>
      </main>

      <Button
        className='my-1'
        loading={saveState.saving}
        disabled={!saveState.savable}
        onClick={() => saveFinalFile()}
      >
        {saveState.saving ? 'Baixando arquivo' : 'Baixar arquivo'}
      </Button>
    </Fragment>
  )
}

export default App;

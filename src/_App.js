// import React, { useRef, useState, useEffect } from 'react';
// import { Form, Button, Modal, Select, Input } from 'antd';
// import Services from './Services';
// import EmailEditor from 'react-email-editor';

// export default (props) => {
//   const [dataFormValues, setDataFormValues] = useState({
//     runrunitTask: '',
//     client: '',
//     subClient: '',
//     campaign: '',
//     emmTitle: '',
//     customClient: undefined,
//     customCampaign: undefined,
//     customSubClient: undefined,
//   });
//   const emailEditorRef = useRef(null);
//   const [modalVisible, setModalVisible] = useState(true);
//   const [dataFormLoading, setDataFormLoading] = useState(false);
//   const { Item } = Form
//   const [clients, setClients] = useState();
//   const [subClients, setSubClients] = useState();
//   const [campaigns, setCampaigns] = useState();
//   const [submitError, setSubmitError] = useState();
//   const [emmDataSent, setEmmDataSent] = useState(false);

//   const submitDataForm = async () => {
//     setDataFormLoading(true);
//     const response = await Services.submitInfoForm(dataFormValues)

//     if (response.error) {
//       if (response.message)
//         setSubmitError(response)
//       setDataFormLoading(false);
//       setDataFormLoading(false);
//       setEmmDataSent(true)
//     }
//     else {
//       setDataFormLoading(false);
//       setModalVisible(false);
//       setDataFormLoading(false);
//       setEmmDataSent(true)
//     }
//   }

//   const registerUploadCallback = () => {
//     emailEditorRef.current.registerCallback("image", async (file, done) => {
//       const fd = new FormData();
//       fd.append('files', file.accepted[0])
//       const response = await Services.uploadSingleFile(fd)
//       if (!response.error) {
//         done({ progress: 100, url: response.data })
//       }
//     })
//   }

//   const fetchCampaigns = async (subClient) => {
//     setCampaigns(undefined)
//     if (subClient !== 'outro') {
//       const response = await Services.getCampaigns(dataFormValues.client, subClient)
//       if (response.error) {
//         setDataFormValues({ ...dataFormValues, campaign: 'Erro ao carregar campanhas' })
//         setCampaigns([{ value: 'Erro ao carregar campanhas', disabled: true }])
//       }
//       else
//         setCampaigns(mapSelectOptions(response.data))
//     }
//     else
//       setCampaigns([])
//   }

//   const fetchSubClients = async (client) => {
//     setSubClients(undefined)
//     if (client !== 'outro') {
//       const response = await Services.getSubClients(client)
//       if (response.error) {
//         setDataFormValues({ ...dataFormValues, subClient: 'Erro ao carregar subclientes' })
//         setSubClients([{ value: 'Erro ao carregar subclientes', disabled: true }])
//       }
//       else
//         setSubClients(mapSelectOptions(response.data))
//     }
//     else
//       setSubClients([])
//   }

//   const handleDataFormInput = (value, name) => {
//     if (name === 'client' && dataFormValues.customClient)
//       setDataFormValues({ ...dataFormValues, [name]: value, 'customClient': undefined });
//     else {
//       setDataFormValues({ ...dataFormValues, [name]: value });
//       if (name === 'client')
//         fetchSubClients(value)
//       else if (name === 'subClient')
//         fetchCampaigns(value)
//     }
//   }

//   const fetchClients = async () => {
//     const response = await Services.getClients()
//     if (!response.error) {
//       setClients(mapSelectOptions(response.data))
//       return
//     }
//     setDataFormValues({ ...dataFormValues, client: 'Erro ao carregar clientes' })
//     setClients([{ value: 'Erro ao carregar clientes', disabled: true }])
//   }

//   const mapSelectOptions = options => {
//     return options.map(client => {
//       return {
//         value: client,
//         disabled: false,
//       }
//     })
//   }

//   const exportHtml = () => {
//     emailEditorRef.current.editor.exportHtml((data) => {
//       const { design, html } = data;
//       console.log('exportHtml', html);
//     });
//   };

//   const onLoad = () => {
//     // editor instance is created
//     // you can load your template here;
//     // const templateJson = {};
//     // emailEditorRef.current.editor.loadDesign(templateJson);
//   }

//   const onReady = () => {
//     // editor is ready
//     registerUploadCallback()
//     console.log('onReady');
//   };

//   useEffect(() => {
//     fetchClients()
//   }, [])

//   return (
//     <>
//       <Modal
//         closable={false}
//         title="Dados do E-mail"
//         visible={modalVisible}
//         footer={[
//           <Button loading={dataFormLoading} disabled={dataFormLoading} form="dataForm" key="submit" htmlType="submit">
//             {dataFormLoading ? 'Enviando' : 'Enviar'}
//           </Button>
//         ]}
//       >
//         <Form
//           id='dataForm'
//           onFinish={submitDataForm}
//           layout="vertical"
//         >

//           <Item label='Cliente' rules={[{ required: true, message: 'Selecione um cliente' }]} >
//             <Select
//               name='client'
//               disabled={(!clients) || (clients[0] && clients[0].disabled)}
//               loading={!clients}
//               value={dataFormValues.client}
//               onChange={e => handleDataFormInput(e, 'client')}
//             >
//               <Option value="" disabled>
//                 {clients ? 'Selecione um cliente' : 'Carregando clientes'}
//               </Option>
//               {clients && clients.map(client => (
//                 <Option value={client.vlue} key={client.value}>
//                   {client.value}
//                 </Option>
//               ))}
//               <Option value="outro">
//                 Novo cliente
//               </Option>
//             </Select>
//           </Item>

//           {dataFormValues.client === 'outro' &&
//             <Item label='Nome do novo cliente' rules={[{ required: true, message: 'Preencha este campo' }]} name="customClient">
//               <Input
//                 value={dataFormValues.customClient}
//                 placeholder="Novo cliente"
//                 onChange={e => handleDataFormInput(e.target.value, e.target.id)}
//               />
//             </Item>
//           }

//           <Item label='Subcliente' rules={[{ required: true, message: 'Selecione um subcliente' }]}>
//             <Select
//               name='subClient'
//               disabled={!subClients || (subClients[0] && subClients[0].disabled)}
//               loading={dataFormValues.client && !subClients}
//               value={dataFormValues.subClient}
//               onChange={e => handleDataFormInput(e, 'subClient')}
//             >
//               <Option value="" disabled>
//                 {
//                   dataFormValues.client ?
//                     subClients ? 'Selecione um subcliente' : 'Carregando subclientes'
//                     :
//                     'Selecione um cliente primeiro'
//                 }
//               </Option>
//               {subClients && subClients.map(sub => (
//                 <Option value={sub.value} key={sub.value}>
//                   {sub.value}
//                 </Option>
//               ))}
//               <Option value="outro">
//                 Novo subcliente
//               </Option>
//             </Select>
//           </Item>

//           {dataFormValues.subClient === 'outro' &&
//             <Item label='Nome do novo subcliente' rules={[{ required: true, message: 'Preencha este campo' }]} name="customSubClient">
//               <Input
//                 value={dataFormValues.customClient}
//                 placeholder="Geral"
//                 onChange={e => handleDataFormInput(e.target.value, e.target.id)}
//               />
//             </Item>
//           }

//           <Item label='Campanha' rules={[{ required: true, message: 'Selecione uma campanha' }]}>
//             <Select
//               disabled={!campaigns || (campaigns[0] && campaigns[0].disabled)}
//               name='campaign'
//               loading={dataFormValues.subClient && !campaigns}
//               value={dataFormValues.campaign}
//               onChange={e => handleDataFormInput(e, 'campaign')}
//             >
//               <Option value="" disabled>
//                 {
//                   dataFormValues.subClient ?
//                     campaigns ? 'Selecione uma campanha' : 'Carregando campanhas'
//                     :
//                     'Selecione um subcliente primeiro'
//                 }
//               </Option>
//               {campaigns && campaigns.map(camp => (
//                 <Option value={camp.value} key={camp.value}>
//                   {camp.value}
//                 </Option>
//               ))}
//               <Option value="outro">
//                 Nova campanha
//               </Option>
//             </Select>
//           </Item>

//           {dataFormValues.campaign === 'outro' &&
//             <Item label='Nome da nova campanha' rules={[{ required: true, message: 'Preencha este campo' }]} name="customCampaign">
//               <Input
//                 value={dataFormValues.customCampaign}
//                 placeholder="Geral"
//                 onChange={e => handleDataFormInput(e.target.value, e.target.id)}
//               />
//             </Item>
//           }

//           <Item
//             validateStatus={submitError && 'error'}
//             help={submitError && submitError.message}
//             addonAfter
//             label='Número e nome da tarefa'
//             rules={[{ required: true, message: 'Preencha este campo' }]}
//             name="runrunitTask"
//           >
//             <Input
//               value={dataFormValues.runrunitTask}
//               placeholder="1234 - Nome da tarefa - Cliente"
//               onChange={e => handleDataFormInput(e.target.value, e.target.id)}
//             />
//           </Item>

//           <Item addonAfter label='Título do e-mail' rules={[{ required: true, message: 'Preencha este campo' }]} name="emmTitle">
//             <Input
//               value={dataFormValues.runrunitTask}
//               placeholder="Cliente - Nome da campanha"
//               onChange={e => handleDataFormInput(e.target.value, e.target.id)}
//             />
//           </Item>
//         </Form>
//       </Modal>

//       <div>
//         <div>
//           <Button disabled={!emmDataSent} onClick={exportHtml}>Export HTML</Button>
//         </div>

//         <EmailEditor ref={emailEditorRef} onLoad={onLoad} onReady={onReady} />
//       </div>
//     </>
//   );
// };
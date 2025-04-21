import { join } from 'path'
import { createBot, createProvider, createFlow, addAnswer, addKeyword, utils, EVENTS } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { getN8nData} from './api/n8n'

const PORT = process.env.PORT ?? 3008


const welcomeFlow = addKeyword<Provider, Database>(['n8n'])
    .addAnswer('Hello welcome to this *Chatbot Agent*')
    .addAction(
        async (ctx, { gotoFlow }) => {
                return gotoFlow(chatFlow)
            },
        
    )
const chatFlow = addKeyword<Provider, Database>(EVENTS.ACTION)
    .addAction(
        { capture: true },
        async (ctx, { flowDynamic, gotoFlow, endFlow}) => {
            if(ctx.body.trim() === 'exit'){
                return endFlow('See you later :)')
            }
            const prompt = ctx.body.trim()
            try {
                const data = await getN8nData(prompt)
                await flowDynamic(data)
            } catch (error){
                return endFlow('Sorry something went wrong')
            }
            return gotoFlow(chatFlow) 
    }
)



const main = async () => {
    const adapterFlow = createFlow([welcomeFlow,chatFlow])
    
    const adapterProvider = createProvider(Provider)
    const adapterDB = new Database()

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    adapterProvider.server.post(
        '/v1/messages',
        handleCtx(async (bot, req, res) => {
            const { number, message, urlMedia } = req.body
            await bot.sendMessage(number, message, { media: urlMedia ?? null })
            return res.end('sended')
        })
    )

    adapterProvider.server.post(
        '/v1/register',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('REGISTER_FLOW', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/samples',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('SAMPLES', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/blacklist',
        handleCtx(async (bot, req, res) => {
            const { number, intent } = req.body
            if (intent === 'remove') bot.blacklist.remove(number)
            if (intent === 'add') bot.blacklist.add(number)

            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ status: 'ok', number, intent }))
        })
    )

    httpServer(+PORT)
}

main()

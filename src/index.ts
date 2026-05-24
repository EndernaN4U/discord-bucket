import { Client, GatewayIntentBits, AttachmentBuilder, TextChannel, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const flushCommand = new SlashCommandBuilder()
    .setName('flush')
    .setDescription('Delete all messages in this channel');

/**
 * METODA 1: Wysyłanie zdjęcia bezpośrednio z dysku lokalnego
 */
async function uploadLocalPhoto(channelId: string, localPath: string, fileName: string): Promise<string> {
    const channel = await client.channels.fetch(channelId);
    
    if (!channel || !(channel instanceof TextChannel)) {
        throw new Error("Kanał nie został znaleziony lub nie jest kanałem tekstowym.");
    }

    // Jeśli plik nie istnieje na dysku, rzucamy błąd przed wysłaniem
    if (!fs.existsSync(localPath)) {
        throw new Error(`Plik pod ścieżką ${localPath} nie istnieje!`);
    }

    // Tworzymy załącznik bezpośrednio wskazując ścieżkę do pliku
    const attachment = new AttachmentBuilder(localPath, { name: fileName });

    const message = await channel.send({
        content: `📸 Nowe zdjęcie z dysku: ${fileName}`,
        files: [attachment]
    });

    console.log(`Zdjęcie wysłane! Message ID: ${message.id}`);
    return message.id;
}

/**
 * METODA 2: Wysyłanie zdjęcia z Buffera (przydatne, gdy generujesz obraz w locie)
 */
async function uploadPhotoFromBuffer(channelId: string, imageBuffer: Buffer, fileName: string): Promise<string> {
    const channel = await client.channels.fetch(channelId);
    
    if (!channel || !(channel instanceof TextChannel)) {
        throw new Error("Kanał nie został znaleziony.");
    }

    // Tworzymy załącznik z surowych danych w pamięci (Buffer)
    const attachment = new AttachmentBuilder(imageBuffer, { name: fileName });

    const message = await channel.send({
        content: `📸 Nowe zdjęcie z pamięci: ${fileName}`,
        files: [attachment]
    });

    console.log(`Zdjęcie z buffera wysłane! Message ID: ${message.id}`);
    return message.id;
}

/**
 * Pobiera obraz z wiadomości Discord i zapisuje go lokalnie.
 */
async function downloadImageFromMessage(channelId: string, messageId: string, outputPath: string): Promise<void> {
    const channel = await client.channels.fetch(channelId);

    if (!channel || !(channel instanceof TextChannel)) {
        throw new Error('Kanał nie został znaleziony.');
    }

    const message = await channel.messages.fetch(messageId);
    const attachment = message.attachments.first();

    if (!attachment) {
        throw new Error('Wiadomość nie zawiera załącznika.');
    }

    const response = await axios.get(attachment.url, { responseType: 'arraybuffer' });

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, Buffer.from(response.data));

    console.log(`Pobrano obraz do: ${outputPath}`);
}

async function flushChannel(channel: TextChannel): Promise<number> {
    let deletedCount = 0;

    while (true) {
        const messages = await channel.messages.fetch({ limit: 100 });

        if (messages.size === 0) {
            break;
        }

        const recentMessages = messages.filter((message) => Date.now() - message.createdTimestamp < 14 * 24 * 60 * 60 * 1000);
        const oldMessages = messages.filter((message) => Date.now() - message.createdTimestamp >= 14 * 24 * 60 * 60 * 1000);

        if (recentMessages.size > 0) {
            const deleted = await channel.bulkDelete(recentMessages, true);
            deletedCount += deleted.size;
        }

        for (const message of oldMessages.values()) {
            await message.delete().catch(() => undefined);
            deletedCount += 1;
        }
    }

    return deletedCount;
}

// Obsługa startu bota
client.once('clientReady', async () => {
    console.log(`Zalogowano jako ${client.user?.tag}!`);

    await Promise.all(
        client.guilds.cache.map(async (guild) => {
            await guild.commands.set([flushCommand.toJSON()]);
        })
    );

    try {
        const CHANNEL_ID = process.env.STORAGE_CHANNEL_ID!;
        const candidateImagePaths = [
            path.resolve(process.cwd(), 'test/testImage/cat.jpg'),
            path.resolve(process.cwd(), 'test/testImages/cat.jpg')
        ];

        const imagePath = candidateImagePaths.find((candidate) => fs.existsSync(candidate));

        if (!imagePath) {
            throw new Error('Nie znaleziono pliku cat.jpg w test/testImage ani test/testImages.');
        }

        console.log(`\nWysyłam cat.jpg z pamięci: ${imagePath}`);
        const imageBuffer = fs.readFileSync(imagePath);
        const messageId = await uploadPhotoFromBuffer(CHANNEL_ID, imageBuffer, 'cat.jpg');

        const downloadPath = path.resolve(process.cwd(), 'download/cat.jpg');
        await downloadImageFromMessage(CHANNEL_ID, messageId, downloadPath);

    } catch (error) {
        console.error("Błąd podczas wysyłania zdjęcia:", error);
    }
});

client.on('', async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    if (interaction.commandName !== 'flush') {
        return;
    }

    if (!interaction.guild || !interaction.channel || !(interaction.channel instanceof TextChannel)) {
        await interaction.reply({ content: 'Ten command działa tylko na kanale tekstowym na serwerze.', ephemeral: true });
        return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
        const deletedCount = await flushChannel(interaction.channel);
        await interaction.editReply(`Wyczyszczono ${deletedCount} wiadomości z tego kanału.`);
    } catch (error) {
        console.error('Błąd podczas flush:', error);
        await interaction.editReply('Nie udało się wyczyścić kanału. Sprawdź uprawnienia bota (Manage Messages).');
    }
});

client.login(process.env.DISCORD_TOKEN);
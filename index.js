module.exports = (bot, options) => {
    const log = bot.sendLog;
    const settings = options.settings;
    const PERMISSION_NAME = 'admin.allowBotTeleport';
    const ADMIN_GROUP_NAME = 'Admin';
    const returnCommand = settings.returnCommand || '/spawn';

    async function setupPermissions() {
        try {
            log(`[Anti-TP] Регистрация права: ${PERMISSION_NAME}`);
            await bot.api.registerPermissions([{
                name: PERMISSION_NAME,
                description: 'Разрешает телепортировать бота без отката.',
                owner: 'plugin:anti-tp-keksik'
            }]);
            
            log(`[Anti-TP] Добавление права в группу ${ADMIN_GROUP_NAME}.`);
            await bot.api.addPermissionsToGroup(ADMIN_GROUP_NAME, [PERMISSION_NAME]);

        } catch (error) {
            log(`[Anti-TP] Ошибка при настройке прав: ${error.message}`);
        }
    }

    setupPermissions();

    const messageHandler = async (rawMessageText) => {
        if (!rawMessageText) return;
        const teleportRegex = /((?:\w|[а-яА-ЯёЁ]){3,16}) телепортировал вас к/ig;
        const match = teleportRegex.exec(rawMessageText);

        if (!match) {
            return;
        }

        const teleporterNickname = match[1];

        try {
            const teleporterUser = await bot.api.getUser(teleporterNickname);

            if (teleporterUser && teleporterUser.hasPermission(PERMISSION_NAME)) {
                return;
            }
            
            bot.api.sendMessage('command', returnCommand);

        } catch (error) {
            log(`[Anti-TP] Ошибка при проверке прав для ${teleporterNickname}: ${error.message}`);
        }
    };

    bot.events.on('core:raw_message', messageHandler);

    bot.once('end', () => {
        bot.events.removeListener('core:raw_message', messageHandler);
        log('[Anti-TP] Плагин выгружен.');
    });

    log(`[Anti-TP] Плагин загружен. Команда для возврата: ${returnCommand}`);
};
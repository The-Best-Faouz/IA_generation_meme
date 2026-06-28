import Agenda from 'agenda';

const mongoConnectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/klip';

export const agenda = new Agenda({ db: { address: mongoConnectionString, collection: 'agendaJobs' } });

agenda.define('generate-meme-job', async (job) => {
  const { type, content, country, userId } = job.attrs.data;
  // TODO: Run generateMeme here, save to DB, and send a notification (FCM / Socket.io) to userId
  console.log(`[Agenda] Processed generate-meme-job for user ${userId}`);
});

export const startAgenda = async () => {
  await agenda.start();
  console.log('Agenda worker started');
};

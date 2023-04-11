const config = require("../config/auth.config");
const db = require("../models");
const cron = require('node-cron');
const User = db.user;


module.exports.calculateUserBenefit = () => {
	const currentDate = new Date()
	cron.schedule('* * * * *', () => {
		console.log('Calcul de bénéfice mensuel en cours...');

		// Accédez aux données du client dans la base de données MongoDB
		User.find().then((clients) => {
			clients.forEach(async (client) => {
				// Calculez le bénéfice mensuel pour chaque client
				/*const beneficeMensuel = client.montantPaye - client.coutService;*/
				const { bricks } = await client
					.populate({
						path: 'bricks',
						populate: {
							path: 'propertie_id',
							select: "reverser"
						}
					})
				if (bricks.length > 0) {
					var user_benefits_array = []
					for (let i = 0; i < bricks.length; i++) {
						const updatedDate = new Date(bricks[i].updatedAt)
						const timeDifference = currentDate - updatedDate
						const dateDifference = timeDifference / (24 * 60 * 60 * 1000)
						if (dateDifference >= 30) {
							let benef = bricks[i].prix_total * bricks[i].propertie_id.reverser
							bricks[i].updatedAt = new Date()
							await bricks[i].save()
							user_benefits_array.push(benef)
						}
					}
					user_benefits = user_benefits_array.reduce((acc, curr) => acc + curr, 0)
					console.log(user_benefits)
					user_benefits = client.user_benefits + user_benefits
					wallet = user_benefits + client.wallet
					// Enregistrez le bénéfice mensuel calculé dans la base de données
					User.updateOne({ _id: client._id }, { user_benefits, wallet }).then(() => {
						console.log(`Bénéfice mensuel pour ${client.firstName} : ${user_benefits} €`);
					}).catch((err) => console.error(`Erreur de mise à jour du bénéfice mensuel pour ${client.nom} :`, err));
				}
			});
		}).catch((err) => console.error('Erreur lors de la récupération des clients :', err));
	});
}





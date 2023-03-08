const config = require("../config/auth.config");
const db = require("../models");
const cron = require('node-cron');
const User = db.user;


module.exports.calculateUserBenefit = () => {
	cron.schedule('* * * * *', () => {
	  console.log('Calcul de bénéfice mensuel en cours...');

	  // Accédez aux données du client dans la base de données MongoDB
	  User.find().then((clients) => {
	    clients.forEach( async (client) => {
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
	    	if(bricks.length > 0) {
	    		var user_benefits = bricks.reduce((acc, curr) => acc + (parseFloat(curr.prix_total) * parseFloat(curr.propertie_id.reverser) / 100), 0);
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





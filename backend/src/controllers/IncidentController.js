const connection = require('../database/connection');

module.exports = {
	async index(req, res) {
		const { page = 1 } = req.query;
		try {
			const [count] = await connection('incidents').count();
			const incidents = await connection('incidents')
				.join('ongs', 'ongs.id', '=', 'incidents.ong_id')
				.limit(5)
				.offset((page - 1) * 5)
				.select(['incidents.*', 'ongs.name', 'ongs.email', 'ongs.city', 'ongs.uf']);
			return res.header('X-Total-Count', count['count(*)']).json(incidents);
		} catch (error) {
			res.status(500).json({ error });
		}
	},

	async create(req, res) {
		const ong_id = req.headers.authorization;
		const { title, description, value } = req.body;
		try {
			const [id] = await connection('incidents').insert({
				title,
				description,
				value,
				ong_id,
			});
			return res.json({ id });
		} catch (error) {
			res.status(500).json({ error });
		}
	},

	async delete(req, res) {
		const { id } = req.params;
		const ong_id = req.headers.authorization;
		try {
			const incident = await connection('incidents').where('id', id).select('ong_id').first();
			if (incident.ong_id !== ong_id) {
				return res.status(401).json({ error: 'Operation not permited' });
			}
			await connection('incidents').where('id', id).delete();
			return res.status(204).send();
		} catch (error) {
			res.status(500).json({ error });
		}
	},
};

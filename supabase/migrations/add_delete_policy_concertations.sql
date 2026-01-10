-- Ajouter une policy RLS pour permettre aux utilisateurs de supprimer leurs propres concertations
CREATE POLICY "Utilisateurs suppriment leurs concertations"
ON concertations
FOR DELETE
TO authenticated
USING (auteur_id = auth.uid());











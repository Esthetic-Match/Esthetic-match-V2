import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité | Esthetic Match",
  description:
    "Politique de confidentialité applicable aux utilisateurs de la Plateforme Esthetic Match.",
};

const sections = [
  {
    title: "Introduction",
    content: [
      `Esthetic Match OÜ (ci-après « Esthetic Match » ou « la Société »), dont le siège social est situé en Estonie, est la société éditrice de la plateforme numérique de mise en relation entre patients et praticiens en médecine esthétique (ci-après « la Plateforme »).`,
      `La présente Politique de Confidentialité (ci-après « la Politique ») a pour objet d'informer l'ensemble des utilisateurs de la Plateforme — patients et praticiens — sur la nature des données personnelles collectées, les finalités et bases juridiques de leur traitement, les destinataires, les durées de conservation, les transferts internationaux éventuels, et les droits dont ils disposent.`,
      `Esthetic Match s'engage à traiter les données personnelles dans le strict respect des lois et réglementations applicables en matière de protection des données dans la juridiction de chaque utilisateur, et en particulier des principes de licéité, loyauté, transparence, minimisation, exactitude, limitation de la conservation, intégrité et confidentialité.`,
    ],
  },
  {
    title: "Article 1 – Définitions",
    content: [
      `« Données personnelles » : toute information se rapportant à une personne physique identifiée ou identifiable, directement ou indirectement.`,
      `« Données de santé » : données à caractère personnel relatives à la santé physique ou mentale d'une personne, y compris les informations relatives aux actes et traitements médicaux. Les données de santé font l'objet d'un régime de protection renforcée au regard de leur caractère sensible.`,
      `« Traitement » : toute opération ou ensemble d'opérations appliquées à des données personnelles (collecte, enregistrement, organisation, structuration, conservation, adaptation, extraction, consultation, utilisation, communication, diffusion, effacement, destruction).`,
      `« Responsable de traitement » : la personne physique ou morale qui détermine les finalités et les moyens du traitement des données personnelles. Pour les traitements décrits dans la présente Politique, Esthetic Match OÜ est responsable de traitement.`,
      `« Sous-traitant » : la personne physique ou morale qui traite des données personnelles pour le compte et sur instruction du responsable de traitement.`,
      `« Responsables conjoints » : deux responsables de traitement ou plus qui déterminent conjointement les finalités et les moyens du traitement. Esthetic Match et les Praticiens agissent en cette qualité pour certains traitements relatifs aux échanges de Pré-consultation en ligne.`,
      `« Utilisateur » : toute personne physique accédant à la Plateforme, qu'il s'agisse d'un patient ou d'un praticien.`,
      `« Plateforme » : la web-application Esthetic Match accessible via navigateur, ainsi que l'ensemble des services associés.`,
    ],
  },
  {
    title: "Article 2 – Identité et coordonnées du responsable de traitement",
    content: [
      `Le responsable de traitement des données personnelles collectées sur la Plateforme est :`,
      `Dénomination sociale : Esthetic Match OÜ`,
      `Forme juridique : société à responsabilité limitée de droit estonien (Osaühing)`,
      `Numéro d'immatriculation : [à compléter par Esthetic Match OÜ — registre estonien des entreprises (Äriregister)]`,
      `Siège social : Harju maakond, Tallinn, Lasnamäe linnaosa, Paepargi tn 47-11, 11417 Estonie`,
      `Délégué à la Protection des Données (DPO) : dpo@estheticmatch.com`,
      `Un Délégué à la Protection des Données (DPO) a été désigné en raison du traitement à grande échelle de données constituant des données de santé au sens de l'article 9 du RGPD et font à ce titre l'objet de mesures de protection renforcées.`,
    ],
  },
  {
    title: "Article 3 – Données collectées et finalités de traitement",
    content: [
      `3.1 Données collectées lors de la création de compte : nom, prénom, adresse e-mail, numéro de téléphone, date de naissance, pays de résidence ou d'exercice, mot de passe haché, photographie de profil facultative.`,
      `Base juridique : exécution du contrat et, pour la vérification de la majorité, obligation légale ou intérêt légitime d'Esthetic Match.`,
      `3.2 Données collectées lors de l'inscription des praticiens : copie de pièce d'identité, diplômes et justificatifs de qualification professionnelle, numéro d'inscription à l'ordre professionnel compétent ou équivalent, attestation d'assurance responsabilité civile professionnelle, RIB/IBAN.`,
      `Base juridique : exécution du contrat et obligation légale.`,
      `3.3 Données collectées lors de l'utilisation de la fonctionnalité « Pré-consultation en ligne » : contenu de la question posée par le patient, photographies soumises par le patient, réponse du praticien, horodatage de l'envoi de la question et de la réponse.`,
      `Ces données constituent des données de santé au sens de l'article 9 du RGPD et font l'objet de mesures de protection renforcées.`,
      `Base juridique : consentement explicite de l'utilisateur, complété par l'exécution du contrat pour la rémunération du praticien.`,
      `Ces données sont conservées pendant cinq (5) ans à compter de la date de l'échange.`,
      `3.4 Données collectées lors des paiements : le prix de chaque Pré-consultation est fixé librement par le Praticien. Esthetic Match traite les données de paiement pour percevoir les Frais de Service Plateforme et reverser aux Praticiens les montants dus.`,
      `Les transactions financières sont traitées par Stripe. Esthetic Match ne collecte ni ne stocke de données bancaires ou de carte de paiement.`,
      `Les données de paiement de l'abonnement Premium sont également traitées par Stripe.`,
      `Base juridique : exécution du contrat.`,
      `3.5 Avis et notations : avis déposés directement sur la Plateforme par des patients vérifiés et avis publics Google affichés via l'API Google My Business.`,
      `Base juridique : intérêt légitime d'Esthetic Match et consentement pour les avis natifs.`,
      `3.6 Données de navigation et données techniques : adresse IP, type et version du navigateur, système d'exploitation, pages consultées, durée des sessions, actions réalisées, cookies et traceurs selon les choix de l'utilisateur.`,
      `Base juridique : intérêt légitime d'Esthetic Match et consentement pour les cookies non essentiels.`,
      `Les journaux de connexion sont conservés 90 jours pour les logs courants et 12 mois pour les logs liés à des incidents de sécurité identifiés.`,
      `3.7 Communications avec le service client : les échanges avec le service client sont conservés aux fins de traitement des demandes et d'amélioration de la qualité du service.`,
    ],
  },
  {
    title: "Article 4 – Données de santé – Régime de protection renforcée",
    content: [
      `Les informations, photographies et descriptions médicales communiquées par les patients dans le cadre de la fonctionnalité « Pré-consultation en ligne » constituent des données de santé.`,
      `Mesures appliquées : chiffrement des données en transit (TLS) et au repos (AES-256), accès strictement limité au patient concerné et au praticien destinataire, hébergement conforme aux exigences applicables, journalisation des accès, durée de conservation limitée.`,
      `Le consentement du patient est recueilli de manière explicite, distincte et informée avant l'envoi de toute question comportant des informations médicales.`,
      `Ce consentement peut être retiré à tout moment, sans affecter la licéité des traitements effectués antérieurement.`,
    ],
  },
  {
    title: "Article 5 – Destinataires des données",
    content: [
      `5.1 Accès interne : seuls les membres de l'équipe Esthetic Match ayant besoin d'accéder aux données dans le cadre de leurs fonctions y ont accès.`,
      `5.2 Praticiens : dans le cadre de la Pré-consultation en ligne, le praticien sélectionné par le patient accède aux données communiquées dans la question.`,
      `Le praticien agit en qualité de responsable conjoint du traitement pour ces données.`,
      `5.3 Sous-traitants techniques : Google Cloud Platform (GCP), Stripe Inc., Google LLC.`,
      `Ces sous-traitants traitent les données personnelles exclusivement sur instruction d'Esthetic Match.`,
      `5.4 Autorités et tiers légalement habilités : Esthetic Match peut communiquer des données aux autorités compétentes lorsque la loi l'exige ou l'autorise.`,
    ],
  },
  {
    title: "Article 6 – Transferts internationaux de données",
    content: [
      `Certains sous-traitants d'Esthetic Match sont établis ou opèrent des infrastructures en dehors de l'Espace Économique Européen.`,
      `Esthetic Match s'assure que tout transfert est encadré par des garanties appropriées : décision d'adéquation, clauses contractuelles types, règles d'entreprise contraignantes ou tout autre mécanisme reconnu.`,
      `Esthetic Match conduit une Analyse d'Impact sur les Transferts pour chaque prestataire établi hors de l'EEE, notamment Google Cloud Platform et Stripe Inc.`,
      `Une synthèse peut être obtenue sur demande motivée adressée au DPO à dpo@estheticmatch.com.`,
    ],
  },
  {
    title: "Article 7 – Coresponsabilité de traitement – Praticiens",
    content: [
      `Pour les traitements relatifs aux échanges de Pré-consultation en ligne, Esthetic Match et le praticien destinataire agissent en qualité de responsables conjoints de traitement.`,
      `Les modalités de cette coresponsabilité sont définies dans l'Accord de Traitement des Données (DPA).`,
      `Les utilisateurs peuvent exercer leurs droits auprès d'Esthetic Match ou directement auprès du praticien concerné.`,
    ],
  },
  {
    title: "Article 8 – Durées de conservation",
    content: [
      `Données de compte : durée de la relation contractuelle augmentée de 3 ans.`,
      `Données relatives aux échanges de Pré-consultation en ligne : durée de la relation contractuelle augmentée de 5 ans.`,
      `Données de paiement : 10 ans à compter de la transaction.`,
      `Données de navigation et journaux techniques : 12 mois.`,
      `Données du service client : 3 ans à compter de la clôture de la demande.`,
      `Documents d'identification des praticiens : durée du Contrat Praticiens augmentée de 3 ans.`,
      `À l'expiration de ces délais, les données sont supprimées de manière sécurisée ou anonymisées de façon irréversible.`,
    ],
  },
  {
    title: "Article 9 – Droits des personnes concernées",
    content: [
      `Les utilisateurs disposent des droits suivants : droit d'accès, droit de rectification, droit à l'effacement, droit à la limitation du traitement, droit à la portabilité, droit d'opposition, droit de retrait du consentement, droit de définir des directives post-mortem.`,
      `Les demandes peuvent être adressées par e-mail à dpo@estheticmatch.com ou par courrier postal à Esthetic Match OÜ, Harju maakond, Tallinn, Lasnamäe linnaosa, Paepargi tn 47-11, 11417 Estonie.`,
      `Esthetic Match peut demander une pièce d'identité en cas de doute raisonnable sur l'identité du demandeur.`,
      `La réponse est adressée dans un délai d'un mois, pouvant être prolongé de deux mois en cas de complexité.`,
      `L'utilisateur peut introduire une réclamation auprès de l'Andmekaitse Inspektsioon (AKI) ou de l'autorité de protection des données de son État de résidence.`,
    ],
  },
  {
    title: "Article 10 – Sécurité des données",
    content: [
      `Esthetic Match met en œuvre des mesures techniques et organisationnelles appropriées contre l'accès non autorisé, l'altération, la divulgation, la perte ou la destruction des données.`,
      `Ces mesures comprennent : chiffrement TLS/HTTPS, chiffrement AES-256, contrôles d'accès stricts, authentification renforcée, journalisation et surveillance des accès, plans de continuité et reprise après sinistre, évaluations régulières de sécurité.`,
      `En cas de violation de données personnelles susceptible d'engendrer un risque, Esthetic Match notifie l'autorité compétente et informe les personnes concernées lorsque le risque est élevé.`,
    ],
  },
  {
    title: "Article 11 – Cookies et technologies de suivi",
    content: [
      `La Plateforme utilise des cookies et technologies similaires.`,
      `Les cookies strictement nécessaires au fonctionnement de la Plateforme sont déposés sans consentement préalable.`,
      `Les autres cookies, notamment analytiques et de personnalisation, sont soumis au consentement préalable de l'utilisateur.`,
    ],
  },
  {
    title: "Article 12 – Données des mineurs",
    content: [
      `La Plateforme est exclusivement destinée aux personnes majeures.`,
      `Esthetic Match collecte la date de naissance aux fins de vérification de la majorité.`,
      `Si Esthetic Match constate qu'un mineur a fourni des données personnelles, ces données sont supprimées sans délai et le compte résilié.`,
      `Les parents ou représentants légaux peuvent contacter Esthetic Match à dpo@estheticmatch.com.`,
    ],
  },
  {
    title: "Article 13 – Liens vers des services tiers",
    content: [
      `La Plateforme peut rediriger vers des services tiers, notamment Doctolib, Stripe et Google.`,
      `Ces services sont soumis à leurs propres politiques de confidentialité.`,
      `Esthetic Match recommande aux utilisateurs de consulter ces politiques avant utilisation.`,
    ],
  },
  {
    title: "Article 14 – Modification de la Politique de Confidentialité",
    content: [
      `La présente Politique peut être modifiée à tout moment pour se conformer aux évolutions légales, réglementaires ou fonctionnelles.`,
      `En cas de modification substantielle, les utilisateurs sont informés par e-mail avec un préavis de trente (30) jours.`,
      `Pour les traitements reposant sur le consentement, les utilisateurs sont invités à confirmer leur consentement.`,
      `La version en vigueur est celle disponible sur la Plateforme à la date de consultation.`,
    ],
  },
  {
    title: "Article 15 – Contact",
    content: [
      `Pour toute question relative à la présente Politique ou au traitement des données personnelles :`,
      `Délégué à la Protection des Données (DPO) : dpo@estheticmatch.com`,
      `Adresse postale : Esthetic Match OÜ, Harju maakond, Tallinn, Lasnamäe linnaosa, Paepargi tn 47-11, 11417 Estonie.`,
    ],
  },
  {
    title: "Annexe – Registre simplifié des activités de traitement",
    content: [
      `Création et gestion de compte : identité, e-mail, téléphone, pays, mot de passe haché. Base juridique : exécution du contrat. Durée : 3 ans après clôture du compte.`,
      `Vérification des praticiens : diplômes, pièce d'identité, attestation RCP, IBAN. Base juridique : exécution du contrat et obligation légale. Durée : contrat + 3 ans.`,
      `Pré-consultation en ligne : questions, photographies, réponses. Base juridique : consentement explicite. Durée : 5 ans après échange.`,
      `Traitement des paiements : identifiant transaction Stripe. Base juridique : exécution du contrat. Durée : 10 ans.`,
      `Affichage des avis : avis natifs et avis Google. Base juridique : intérêt légitime et consentement. Durée : 3 ans pour les avis natifs.`,
      `Navigation et sécurité : adresse IP, logs, comportement de navigation. Base juridique : intérêt légitime. Durée : 12 mois.`,
      `Service client : contenu des échanges avec le support. Base juridique : exécution du contrat et intérêt légitime. Durée : 3 ans.`,
      `Cookies analytiques : données de navigation agrégées. Base juridique : consentement. Durée : 2 ans.`,
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#FAF9F7] px-4 py-10 text-[#283C5D] sm:px-6 lg:px-8">
      <article className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[#283C5D]/10 bg-white shadow-sm">
        <header className="border-b border-[#283C5D]/10 bg-gradient-to-br from-white via-[#FAF9F7] to-[#f4e4c6]/40 px-6 py-10 sm:px-10 lg:px-14">
          <p className="mb-4 inline-flex rounded-full border border-[#283C5D]/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#283C5D]/70">
            Version 1.0 – Mai 2026
          </p>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Politique de Confidentialité
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#283C5D]/70">
            Applicable à l'ensemble des utilisateurs de la Plateforme Esthetic
            Match.
          </p>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-[#283C5D]/50">
            Confidentiel
          </p>
        </header>

        <div className="space-y-10 px-6 py-10 sm:px-10 lg:px-14">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-3xl border border-[#283C5D]/10 bg-[#FAF9F7]/50 p-6 sm:p-8"
            >
              <h2 className="text-2xl font-bold tracking-tight text-[#283C5D]">
                {section.title}
              </h2>

              <div className="mt-5 space-y-4">
                {section.content.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-sm leading-7 text-[#283C5D]/75 sm:text-base sm:leading-8"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
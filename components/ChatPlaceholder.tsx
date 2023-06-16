import IconExclamationTriangle from "./icons/IconIconExclamationTriangle";
import IconLightningCharge from "./icons/IconLightingCharge";
import IconSunTwentyFour from "./icons/IconSunTwentyFour";

export const ChatPlaceholder = () => {
  return (
    <div className="m-5 md:mt-20">
      <h3 className="text-4xl font-bold text-center my-8">ChatPRODAM</h3>
      <div className="flex flex-col md:flex-row gap-5 m-auto mb-8 md:max-w-4xl">
        <div>
          <div className="flex justify-center items-center text-lg mb-3">
            <IconSunTwentyFour width={24} height={24} className="mr-3" />
            <b>Exemplos</b>
          </div>
          <div className="bg-gpt-lightgray rounded text-center text-sm text-black mb-3 p-3">
            "Quando a Prodam foi fundada e quantos funcionários possui hoje?"
          </div>          
          <div className="bg-gpt-lightgray rounded text-center text-sm text-black mb-3 p-3">
            "Quantas áreas a empresa possui?"
          </div> 
          <div className="bg-gpt-lightgray rounded text-center text-sm text-black mb-3 p-3">
            "Liste as diretorias e gerências da Prodam."
          </div> 
        </div>
        <div>
          <div className="flex justify-center items-center text-lg mb-3">
            <IconLightningCharge width={24} height={24} className="mr-3" />
            <b>Capacidade</b>
          </div>
          <div className="bg-gpt-lightgray rounded text-center text-sm text-black mb-3 p-3">
            Lembra o que foi dito anteriormente na conversa
          </div>          
          <div className="bg-gpt-lightgray rounded text-center text-sm text-black mb-3 p-3">
            Treinado para recusar pedidos inapropriados
          </div> 
          <div className="bg-gpt-lightgray rounded text-center text-sm text-black mb-3 p-3">
            Treinado com as informações específicas da Prodam-SP
          </div> 
        </div>
        <div>
          <div className="flex justify-center items-center text-lg mb-3">
            <IconExclamationTriangle width={24} height={24} className="mr-3" />
            <b>Limitações</b>
          </div>
          <div className="bg-gpt-lightgray rounded text-center text-sm text-black mb-3 p-3">
            Ocasionalmente pode gerar informações incorretas
          </div>          
          <div className="bg-gpt-lightgray rounded text-center text-sm text-black mb-3 p-3">
            Ocasionalmente, pode produzir instruções prejudiciais ou conteúdo tendencioso
          </div> 
          <div className="bg-gpt-lightgray rounded text-center text-sm text-black mb-3 p-3">
            Conhecimento limitado do mundo e eventos após 2021
          </div> 
        </div>
      </div>
      
    </div>
  );
}
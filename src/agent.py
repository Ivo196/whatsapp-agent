from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_community.tools import TavilySearchResults
from dotenv import load_dotenv
load_dotenv()


model = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.7,
)

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a friendly assistant called Max."),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

search = TavilySearchResults()
tools= [search]

agent = create_openai_functions_agent(
    llm=model,
    prompt=prompt,
    tools=tools
)

agentExecutor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True
)

response = agentExecutor.invoke({
    "input": 'What is the weather in New York today? '
})
print(response)
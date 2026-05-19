-- CreateTable
CREATE TABLE "RM" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cluster" TEXT NOT NULL,
    "segment" TEXT NOT NULL,
    "portfolioSize" INTEGER NOT NULL,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "weeklyPoints" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RM_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "company" TEXT,
    "segment" TEXT NOT NULL,
    "subSegment" TEXT,
    "aum" DECIMAL(65,30),
    "annualRevenue" DECIMAL(65,30),
    "lastInteraction" TIMESTAMP(3),
    "signalType" TEXT,
    "nbaProduct" TEXT,
    "riskFlag" BOOLEAN NOT NULL DEFAULT false,
    "riskReason" TEXT,
    "city" TEXT,
    "sector" TEXT,
    "relationshipSince" TIMESTAMP(3),
    "phoneNumber" TEXT,
    "emailAddress" TEXT,
    "cifId" TEXT,
    "creditScore" INTEGER,
    "loyaltyTier" TEXT,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Priority" (
    "id" TEXT NOT NULL,
    "rmId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "whyNow" TEXT NOT NULL,
    "urgencyBadge" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dealValue" DECIMAL(65,30),
    "priorityScore" DOUBLE PRECISION,
    "managerAligned" BOOLEAN NOT NULL DEFAULT false,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Priority_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrepPack" (
    "id" TEXT NOT NULL,
    "priorityId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PrepPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutoAction" (
    "id" TEXT NOT NULL,
    "rmId" TEXT NOT NULL,
    "customerId" TEXT,
    "column" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "agentSource" TEXT NOT NULL,
    "actionable" BOOLEAN NOT NULL DEFAULT false,
    "approved" BOOLEAN,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutoAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OvernightStats" (
    "id" TEXT NOT NULL,
    "rmId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tier1RepliesSent" INTEGER NOT NULL,
    "salesforceUpdated" INTEGER NOT NULL,
    "kycRemindersSent" INTEGER NOT NULL,
    "timeSavedMinutes" INTEGER NOT NULL,
    "actionsComplete" INTEGER NOT NULL,
    "actionsAwaitingReview" INTEGER NOT NULL,

    CONSTRAINT "OvernightStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyDebrief" (
    "id" TEXT NOT NULL,
    "rmId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerTimeMin" INTEGER NOT NULL,
    "autoActionsCount" INTEGER NOT NULL,
    "slaBreachers" INTEGER NOT NULL,
    "headline" TEXT NOT NULL,
    "tomorrowPreview" TEXT NOT NULL,
    "totalCalls" INTEGER NOT NULL DEFAULT 0,
    "dealsProgressed" INTEGER NOT NULL DEFAULT 0,
    "revenueInfluenced" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "DailyDebrief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebriefEvent" (
    "id" TEXT NOT NULL,
    "debriefId" TEXT NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,

    CONSTRAINT "DebriefEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leaderboard" (
    "id" TEXT NOT NULL,
    "rmId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "cluster" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "streakDays" INTEGER NOT NULL,
    "delta" INTEGER NOT NULL,
    "isCurrentUser" BOOLEAN NOT NULL DEFAULT false,
    "rmName" TEXT NOT NULL,
    "weekOf" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManagerAlignment" (
    "id" TEXT NOT NULL,
    "rmId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL,
    "alignedCount" INTEGER NOT NULL,
    "totalCount" INTEGER NOT NULL,
    "managerName" TEXT NOT NULL,
    "managerEmail" TEXT,

    CONSTRAINT "ManagerAlignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailThread" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "customerId" TEXT,
    "rmId" TEXT NOT NULL,
    "initiatedBy" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "lastActivity" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "aiClassification" TEXT,
    "sentimentScore" INTEGER,
    "competitorFlag" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EmailThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Email" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "fromName" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "toName" TEXT NOT NULL,
    "ccAddress" TEXT,
    "subject" TEXT NOT NULL,
    "bodyText" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "direction" TEXT NOT NULL,
    "generatedBy" TEXT NOT NULL,
    "aiConfidence" DOUBLE PRECISION,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "classification" TEXT,
    "sentiment" TEXT,
    "entities" JSONB,
    "attachments" JSONB,

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallLog" (
    "id" TEXT NOT NULL,
    "rmId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "durationMin" INTEGER,
    "direction" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "sentimentPre" TEXT,
    "sentimentPost" TEXT,
    "sentimentDelta" INTEGER,
    "keyTopics" TEXT[],
    "actionItems" JSONB,
    "transcriptSummary" TEXT,
    "nbaTriggered" BOOLEAN NOT NULL DEFAULT false,
    "dealValue" DECIMAL(65,30),
    "outcomeLabel" TEXT,

    CONSTRAINT "CallLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerNote" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "rmId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "noteType" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "linkedCallId" TEXT,

    CONSTRAINT "CustomerNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductHolding" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "value" DECIMAL(65,30),
    "startDate" TIMESTAMP(3),
    "maturityDate" TIMESTAMP(3),
    "interestRate" DOUBLE PRECISION,
    "status" TEXT NOT NULL,
    "accountRef" TEXT,

    CONSTRAINT "ProductHolding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NBASignalEvent" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "rmId" TEXT NOT NULL,
    "signalType" TEXT NOT NULL,
    "signalData" JSONB NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL,
    "nbaProduct" TEXT NOT NULL,
    "nbaScript" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "outcome" TEXT,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "NBASignalEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentRunLog" (
    "id" TEXT NOT NULL,
    "rmId" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "runAt" TIMESTAMP(3) NOT NULL,
    "trigger" TEXT NOT NULL,
    "inputSummary" TEXT NOT NULL,
    "outputSummary" TEXT NOT NULL,
    "actionsCount" INTEGER NOT NULL,
    "tokensUsed" INTEGER,
    "latencyMs" INTEGER,
    "status" TEXT NOT NULL,
    "relatedAutoActionId" TEXT,

    CONSTRAINT "AgentRunLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CBSAlert" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "rmId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "triggeredAt" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "actionTaken" TEXT,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "CBSAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerMilestone" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "milestoneType" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "value" DECIMAL(65,30),
    "description" TEXT NOT NULL,
    "flaggedForRM" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CustomerMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RM_email_key" ON "RM"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_cifId_key" ON "Customer"("cifId");

-- AddForeignKey
ALTER TABLE "Priority" ADD CONSTRAINT "Priority_rmId_fkey" FOREIGN KEY ("rmId") REFERENCES "RM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Priority" ADD CONSTRAINT "Priority_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrepPack" ADD CONSTRAINT "PrepPack_priorityId_fkey" FOREIGN KEY ("priorityId") REFERENCES "Priority"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutoAction" ADD CONSTRAINT "AutoAction_rmId_fkey" FOREIGN KEY ("rmId") REFERENCES "RM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutoAction" ADD CONSTRAINT "AutoAction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OvernightStats" ADD CONSTRAINT "OvernightStats_rmId_fkey" FOREIGN KEY ("rmId") REFERENCES "RM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyDebrief" ADD CONSTRAINT "DailyDebrief_rmId_fkey" FOREIGN KEY ("rmId") REFERENCES "RM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebriefEvent" ADD CONSTRAINT "DebriefEvent_debriefId_fkey" FOREIGN KEY ("debriefId") REFERENCES "DailyDebrief"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leaderboard" ADD CONSTRAINT "Leaderboard_rmId_fkey" FOREIGN KEY ("rmId") REFERENCES "RM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagerAlignment" ADD CONSTRAINT "ManagerAlignment_rmId_fkey" FOREIGN KEY ("rmId") REFERENCES "RM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailThread" ADD CONSTRAINT "EmailThread_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailThread" ADD CONSTRAINT "EmailThread_rmId_fkey" FOREIGN KEY ("rmId") REFERENCES "RM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "EmailThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallLog" ADD CONSTRAINT "CallLog_rmId_fkey" FOREIGN KEY ("rmId") REFERENCES "RM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallLog" ADD CONSTRAINT "CallLog_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerNote" ADD CONSTRAINT "CustomerNote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerNote" ADD CONSTRAINT "CustomerNote_rmId_fkey" FOREIGN KEY ("rmId") REFERENCES "RM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductHolding" ADD CONSTRAINT "ProductHolding_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NBASignalEvent" ADD CONSTRAINT "NBASignalEvent_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NBASignalEvent" ADD CONSTRAINT "NBASignalEvent_rmId_fkey" FOREIGN KEY ("rmId") REFERENCES "RM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentRunLog" ADD CONSTRAINT "AgentRunLog_rmId_fkey" FOREIGN KEY ("rmId") REFERENCES "RM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CBSAlert" ADD CONSTRAINT "CBSAlert_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CBSAlert" ADD CONSTRAINT "CBSAlert_rmId_fkey" FOREIGN KEY ("rmId") REFERENCES "RM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerMilestone" ADD CONSTRAINT "CustomerMilestone_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
